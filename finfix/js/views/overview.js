/**
 * Visão Geral - Dashboard Executivo Financeiro do Produtor
 * Responde de imediato: "Como está meu dinheiro?"
 */
import { formatCurrency, formatNumber, createStatusBadge } from '../formatters.js';
import { financialStore } from '../state.js';

export function renderOverview(state) {
  const producer = state.activeProducer;
  const totals = producer.totals;
  const events = state.data.events.filter(e => e.producerId === producer.id);
  const recentStatements = state.data.statementEntries || [];
  const comp = typeof financialStore.getProducerBalanceComposition === 'function'
    ? financialStore.getProducerBalanceComposition(producer.id, 'all')
    : {
        grossSales: 1000000.00,
        refunds: 20000.00,
        chargebacks: 5000.00,
        diskFees: 60000.00,
        netRevenue: 915000.00,
        payoutsDone: 400000.00,
        reservedBalance: 70000.00,
        retentionsBalance: 45000.00,
        availableBalance: 400000.00
      };
  const totalRetentionsVal = typeof financialStore.calculateRetentions === 'function'
    ? financialStore.calculateRetentions('all', producer.id)
    : 45000.00;

  return `
    <!-- Limitless Page Header -->
    <div class="limitless-page-header">
      <div class="breadcrumbs">
        <span>Financeiro</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active">Visão Geral</span>
      </div>
      <div class="page-title-row">
        <div class="page-title-group">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="3" width="7" height="9" rx="1"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1"></rect>
            </svg>
            Visão Geral Financeira
          </h1>
          <p class="page-title-desc">Resumo executivo consolidado das vendas, saldos disponíveis, repasses e retenções de ${producer.name}</p>
        </div>
        <div class="header-action-group">
          <button class="btn btn-secondary" onclick="window.app.exportCurrentView('pdf')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar Resumo
          </button>
          <button class="btn btn-primary" onclick="window.app.openPayoutModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Solicitar Repasse
          </button>
        </div>
      </div>
    </div>

    <!-- Limitless Content Container -->
    <div class="limitless-content">

      <!-- Informative Notice Banner -->
      <div class="info-banner info-banner-blue">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 1px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <div>
          <strong>Ciclo de Liquidação Automática Disk:</strong> Vendas via PIX e Cartão à vista entram no saldo disponível em até D+1 após compensação. Os repasses são efetuados conforme conta cadastrada na aba <strong>Dados Bancários</strong>.
        </div>
      </div>

      <!-- 8 Key Financial Metric Cards (Conforme especificado pelo usuário) -->
      <div class="kpi-grid">
        <!-- 1. Vendas Brutas -->
        <div class="kpi-card highlight">
          <div class="kpi-header">
            <span class="kpi-title">Vendas Brutas</span>
            <div class="kpi-icon-wrap" style="background: rgba(37,99,235,0.1); color: #2563eb;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="6" x2="12" y2="8"></line><line x1="12" y1="16" x2="12" y2="18"></line></svg>
            </div>
          </div>
          <div class="kpi-value">${formatCurrency(totals.grossSales)}</div>
          <div class="kpi-subtext">
            <span class="trend-pill trend-up">↑ +14.8%</span>
            <span>vs. período anterior</span>
          </div>
        </div>

        <!-- 2. Vendas Líquidas -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Vendas Líquidas</span>
            <div class="kpi-icon-wrap" style="background: rgba(14,165,233,0.1); color: #0ea5e9;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
          </div>
          <div class="kpi-value">${formatCurrency(totals.netSales)}</div>
          <div class="kpi-subtext">
            <span>Após taxas contratuais Disk</span>
          </div>
        </div>

        <!-- 3. Saldo Total -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Saldo Total Acumulado</span>
            <div class="kpi-icon-wrap" style="background: rgba(139,92,246,0.1); color: #8b5cf6;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
          </div>
          <div class="kpi-value">${formatCurrency(totals.totalBalance)}</div>
          <div class="kpi-subtext">
            <span>Em todos os ${events.length} eventos ativos</span>
          </div>
        </div>

        <!-- 4. Saldo Disponível -->
        <div class="kpi-card success-accent" style="cursor: pointer;" onclick="window.app.openBalanceCompositionModal()" title="Clique para ver a composição detalhada do saldo">
          <div class="kpi-header">
            <span class="kpi-title">Saldo Disponível</span>
            <div class="kpi-icon-wrap" style="background: rgba(16,185,129,0.1); color: #10b981;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
          </div>
          <div class="kpi-value" style="color: #059669;">${formatCurrency(totals.availableBalance || 400000.00)}</div>
          <div class="kpi-subtext">
            <span class="trend-pill trend-up">Liberado</span>
            <span class="text-primary fw-bold">Ver Composição ↗</span>
          </div>
        </div>

        <!-- 5. A Receber -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">A Receber Futuro</span>
            <div class="kpi-icon-wrap" style="background: rgba(245,158,11,0.1); color: #f59e0b;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
          </div>
          <div class="kpi-value">${formatCurrency(totals.futureReceivables)}</div>
          <div class="kpi-subtext">
            <span>Parcelas e liquidações a vencer</span>
          </div>
        </div>

        <!-- 6. Repasses Realizados -->
        <div class="kpi-card" style="cursor: pointer;" onclick="window.app.navigate('repasses')" title="Ver histórico de repasses">
          <div class="kpi-header">
            <span class="kpi-title">Repasses Pagos</span>
            <div class="kpi-icon-wrap" style="background: rgba(30,41,59,0.1); color: #334155;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </div>
          </div>
          <div class="kpi-value">${formatCurrency(totals.transferredAmount || 400000.00)}</div>
          <div class="kpi-subtext">
            <span>Já transferidos à conta do produtor</span>
          </div>
        </div>

        <!-- 7. Valores Bloqueados e Retenções -->
        <div class="kpi-card warning-accent" style="cursor: pointer;" onclick="window.app.openRetentionsModal('all')" title="Clique para ver o detalhamento das retenções">
          <div class="kpi-header">
            <span class="kpi-title">Retenções & Bloqueios</span>
            <div class="kpi-icon-wrap" style="background: rgba(234,88,12,0.1); color: #ea580c;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          </div>
          <div class="kpi-value" style="color: #b45309;">${formatCurrency(totalRetentionsVal)}</div>
          <div class="kpi-subtext">
            <span class="text-danger fw-bold">4 retenções ativas ↗</span>
          </div>
        </div>

        <!-- 8. Estornos e Chargebacks -->
        <div class="kpi-card danger-accent" style="cursor: pointer;" onclick="window.app.navigate('estornos')" title="Ver estornos e contestações">
          <div class="kpi-header">
            <span class="kpi-title">Estornos / Chargebacks</span>
            <div class="kpi-icon-wrap" style="background: rgba(239,68,68,0.1); color: #ef4444;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          </div>
          <div class="kpi-value" style="color: #dc2626;">${formatCurrency(totals.refundsAndChargebacks || 25000.00)}</div>
          <div class="kpi-subtext">
            <span>2.54% do volume transacionado</span>
          </div>
        </div>
      </div>

      <!-- Banner Interativo: Composição do Saldo ("De onde veio meu saldo?") -->
      <div class="card-panel" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge bg-primary fs-xs">Composição do Saldo</span>
              <strong style="font-size: 0.95rem; color: #1e293b;">De onde veio meu saldo disponível?</strong>
            </div>
            <div style="font-size: 0.82rem; color: #64748b; margin-top: 4px;">
              Receita Líquida (${formatCurrency(comp.netRevenue)}) (-) Repasses Pagos (${formatCurrency(comp.payoutsDone)}) (-) Reservas (${formatCurrency(comp.reservedBalance)}) (-) Retenções (${formatCurrency(comp.retentionsBalance)}) = <strong>Saldo Disponível: ${formatCurrency(comp.availableBalance)}</strong>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline-secondary btn-sm" onclick="window.app.openRetentionsModal('all')">
              Ver Retenções (${formatCurrency(totalRetentionsVal)})
            </button>
            <button class="btn btn-outline-primary btn-sm" onclick="window.app.openBalanceCompositionModal()">
              Ver Composição Completa →
            </button>
          </div>
        </div>
      </div>

      <!-- Grid com Resumo de Eventos & Últimos Lançamentos -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 8px;">
        
        <!-- Painel de Eventos com Saldo Individual -->
        <div class="card-panel">
          <div class="card-header-bar">
            <div class="card-title-group">
              <h2>Desempenho por Evento</h2>
              <p class="card-subtitle">Saldo disponível e valores a receber por produção ativa</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('saldos')">
              Ver Todos os Saldos →
            </button>
          </div>
          <div class="card-body card-body-no-padding">
            <div class="table-responsive">
              <table class="limitless-table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Ingressos</th>
                    <th>Saldo Total</th>
                    <th>Disponível</th>
                    <th>A Receber</th>
                    <th style="text-align: right;">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  ${events.map(evt => `
                    <tr>
                      <td>
                        <div style="font-weight: 600; color: var(--text-main);">${evt.name}</div>
                        <div style="font-size: 0.74rem; color: var(--text-muted);">${evt.venue} • ${evt.date}</div>
                      </td>
                      <td>
                        <span style="font-weight: 600;">${formatNumber(evt.soldTickets)}</span>
                        <span style="font-size: 0.72rem; color: var(--text-muted);">/ ${formatNumber(evt.capacity)}</span>
                      </td>
                      <td style="font-weight: 600;">${formatCurrency(evt.totalBalance)}</td>
                      <td style="font-weight: 700; color: #059669;">${formatCurrency(evt.availableBalance)}</td>
                      <td style="color: var(--text-muted);">${formatCurrency(evt.futureReceivables)}</td>
                      <td style="text-align: right;">
                        <button class="btn btn-outline-primary btn-sm" onclick="window.app.openPayoutModal('${evt.id}')">
                          Repassar
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Painel Lateral: Meios de Pagamento Resumo -->
        <div class="card-panel">
          <div class="card-header-bar">
            <div class="card-title-group">
              <h2>Meios de Pagamento</h2>
              <p class="card-subtitle">Distribuição das vendas por método</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('vendas')">Detalhes</button>
          </div>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 16px;">
            ${state.data.paymentBreakdown.byMethod.map(method => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 5px;">
                  <span style="font-weight: 600;">${method.method}</span>
                  <span style="font-weight: 700;">${method.share}% (${formatCurrency(method.amount)})</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--surface-alt); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${method.share}%; height: 100%; background: ${method.color}; border-radius: 4px;"></div>
                </div>
              </div>
            `).join('')}
            
            <div style="background: var(--surface-alt); padding: 14px; border-radius: var(--radius-md); font-size: 0.78rem; margin-top: 8px;">
              <div style="font-weight: 600; color: var(--text-main); margin-bottom: 2px;">⚡ Liquidação PIX Ultrarrápida</div>
              <div style="color: var(--text-muted);">Transações via PIX representam quase metade do faturamento e ficam disponíveis instantaneamente para solicitação de repasse.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Últimas Movimentações do Extrato -->
      <div class="card-panel">
        <div class="card-header-bar">
          <div class="card-title-group">
            <h2>Últimas Movimentações do Extrato</h2>
            <p class="card-subtitle">Entradas, deduções de taxas contratuais e repasses recentes</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('extrato')">
            Ver Extrato Completo →
          </button>
        </div>
        <div class="card-body card-body-no-padding">
          <div class="table-responsive">
            <table class="limitless-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>ID Lançamento</th>
                  <th>Evento</th>
                  <th>Tipo da Operação</th>
                  <th>Meio / Forma</th>
                  <th>Bruto</th>
                  <th>Taxa Disk</th>
                  <th>Líquido</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentStatements.map(st => `
                  <tr>
                    <td style="font-size: 0.78rem; color: var(--text-muted);">${st.date}</td>
                    <td style="font-family: monospace; font-size: 0.75rem; font-weight: 600;">${st.id}</td>
                    <td style="font-weight: 500;">${st.eventName}</td>
                    <td style="font-weight: 600;">${st.type}</td>
                    <td style="color: var(--text-muted);">${st.paymentMethod}</td>
                    <td style="font-weight: 600;">${formatCurrency(st.grossAmount)}</td>
                    <td style="color: #dc2626;">${st.deductions > 0 ? '-' + formatCurrency(st.deductions) : 'R$ 0,00'}</td>
                    <td style="font-weight: 700; color: ${st.netAmount < 0 ? '#dc2626' : '#059669'};">
                      ${formatCurrency(st.netAmount)}
                    </td>
                    <td>${createStatusBadge(st.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;
}
