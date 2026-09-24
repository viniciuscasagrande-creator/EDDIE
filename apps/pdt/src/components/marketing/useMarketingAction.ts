'use client';

import { useState, useCallback } from 'react';
import {
  MarketingAction,
  MarketingActionContext,
  MarketingActionResult,
  ActionPhase,
  ACTION_METADATA,
} from '../../lib/marketing-actions/action-types';
import { MarketingActionService } from '../../lib/marketing-actions/marketing-action-service';

export interface UseMarketingActionOptions {
  onSuccess?: (result: MarketingActionResult) => void;
  onError?: (err: Error) => void;
  onStatusChange?: (status: string) => void;
}

export function useMarketingAction(options: UseMarketingActionOptions = {}) {
  const [phase, setPhase] = useState<ActionPhase>('IDLE');
  const [currentAction, setCurrentAction] = useState<MarketingAction | null>(null);
  const [pendingContext, setPendingContext] = useState<MarketingActionContext | null>(null);
  const [lastResult, setLastResult] = useState<MarketingActionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Executa a ação diretamente após confirmação
  const executeNow = useCallback(
    async (action: MarketingAction, context: MarketingActionContext = {}) => {
      setPhase('PROCESSING');
      setErrorMsg(null);
      setCurrentAction(action);

      try {
        const result = await MarketingActionService.executeAction(action, context);
        setLastResult(result);

        if (result.success) {
          setPhase('SUCCESS');
          if (options.onSuccess) options.onSuccess(result);
          if (result.statusReal?.reconciledStatus && options.onStatusChange) {
            options.onStatusChange(result.statusReal.reconciledStatus);
          }
        } else {
          setPhase('ERROR');
          setErrorMsg(result.error || result.message || 'Falha ao executar ação');
          if (options.onError) options.onError(new Error(result.error || 'Erro operacional'));
        }
      } catch (err: any) {
        setPhase('ERROR');
        const msg = err?.message || 'Erro de comunicação ao executar ação';
        setErrorMsg(msg);
        if (options.onError) options.onError(new Error(msg));
      } finally {
        setPendingContext(null);
      }
    },
    [options]
  );

  // Ponto de entrada: se precisar de confirmação, entra em fase 'CONFIRMING'
  const triggerAction = useCallback(
    (action: MarketingAction, context: MarketingActionContext = {}) => {
      const meta = ACTION_METADATA[action];
      if (meta?.requiresConfirmation) {
        setCurrentAction(action);
        setPendingContext(context);
        setPhase('CONFIRMING');
      } else {
        executeNow(action, context);
      }
    },
    [executeNow]
  );

  const confirmPendingAction = useCallback(() => {
    if (currentAction) {
      executeNow(currentAction, pendingContext || {});
    }
  }, [currentAction, pendingContext, executeNow]);

  const cancelPendingAction = useCallback(() => {
    setPhase('IDLE');
    setCurrentAction(null);
    setPendingContext(null);
  }, []);

  const reset = useCallback(() => {
    setPhase('IDLE');
    setCurrentAction(null);
    setPendingContext(null);
    setLastResult(null);
    setErrorMsg(null);
  }, []);

  return {
    phase,
    isProcessing: phase === 'PROCESSING',
    isConfirming: phase === 'CONFIRMING',
    currentAction,
    lastResult,
    errorMsg,
    triggerAction,
    confirmPendingAction,
    cancelPendingAction,
    reset,
  };
}
