# EDDIE 11.9 — Portaria, Antifraude, Conciliação e Chargeback

## Missão
Aprofundar o pós-venda e a operação presencial:
Portaria/Check-in em tempo real + proteção antifraude + conciliação automática Gateway × Pedido × Ledger × Banco + estorno/chargeback.

## 1. Central de Portaria em Tempo Real
Contexto obrigatório: produtor → evento → sessão → portaria/dispositivo.
Painel:
- entradas válidas
- tentativas recusadas
- ingressos já utilizados
- ingressos restantes
- ritmo de entrada/minuto
- ocupação atual
- scanners online/offline
- última sincronização
- alertas operacionais

Fluxo de leitura:
QR → validar assinatura/token → localizar ingresso → validar evento/sessão/status/janela → consumir atomicamente → registrar check-in → atualizar painel.

Resultados:
VALIDO, JA_UTILIZADO, CANCELADO, ESTORNADO, INVALIDO, FORA_DA_SESSAO, FORA_DA_JANELA, BLOQUEADO_RISCO.

Reentrada somente quando regra explícita do evento permitir.

## 2. Dispositivos e Operadores
Cadastro/autorização por evento e portaria.
Sessão curta, revogação remota, heartbeat, versão do app e trilha de auditoria.
Nunca confiar em eventoId enviado pelo scanner sem validar autorização do dispositivo.

## 3. Modo degradado/offline
Não habilitar automaticamente.
Quando explicitamente configurado:
- pacote criptograficamente verificável e limitado à sessão/evento;
- validade curta;
- fila local de leituras;
- prevenção local de duplicidade;
- sincronização idempotente;
- conflitos destacados para revisão.
Não transportar PII desnecessária no pacote offline.

## 4. Antifraude operacional
Motor de sinais, não decisão opaca.
Sinais possíveis:
- QR já utilizado;
- múltiplas tentativas em curto intervalo;
- uso simultâneo em portarias distintas;
- ingresso cancelado/estornado;
- divergência evento/sessão;
- dispositivo não autorizado;
- velocidade/anomalia de leituras;
- reemissão com token antigo;
- pagamento posteriormente contestado.
Ações: permitir, alertar, bloquear, exigir revisão.
Toda decisão registra sinais e regra acionada.

## 5. Conciliação automática
Pipeline:
Gateway/Adquirente → Pagamento → Pedido → Ledger → Liquidação → Extrato/Retorno bancário.

Matching por identificadores fortes primeiro:
providerTransactionId, providerPaymentId, pedidoId, NSU/TID/E2EId quando disponíveis.
Depois matching assistido por valor/data apenas para fila de revisão — nunca baixa automática ambígua.

Estados:
CONCILIADO, DIVERGENTE, NAO_LOCALIZADO, VALOR_DIVERGENTE, DUPLICADO, AGUARDANDO_LIQUIDACAO, REVISAO_MANUAL.

Painel de divergências com origem, esperado, recebido, diferença, aging, responsável e ação.

## 6. Chargeback e contestação
Caso próprio ligado ao pagamento/pedido/ingressos/ledger.
Estados:
ABERTO, EVIDENCIAS_PENDENTES, EM_DISPUTA, GANHO, PERDIDO, ENCERRADO.

Ao receber chargeback:
- idempotência pelo identificador do provedor;
- bloquear valor elegível quando necessário;
- sinalizar ingressos conforme regra e timing;
- criar lançamentos/reversões sem apagar histórico;
- preservar evidências operacionais (pagamento, emissão, check-in, dispositivo, timestamps);
- refletir no saldo/repasse conforme regras financeiras.

## 7. Estorno
Parcial ou total conforme gateway e regra.
Fluxo:
solicitação → autorização/permissão → gateway → confirmação → ingresso(s) afetados → reversão Ledger → saldo/repasse → auditoria.
Nunca marcar estorno como concluído antes da confirmação real do provedor quando depender dele.

## 8. Auditoria e observabilidade
Correlation ID ponta a ponta.
Auditar: operador, dispositivo, IP quando aplicável, evento, sessão, ingresso, ação, resultado, regra/sinal e timestamp.
Métricas: throughput de portaria, p95 validação, recusas, duplicidades, scanners offline, divergências financeiras, aging, chargebacks e taxa de recuperação.

## 9. Segurança
- QR opaco/assinado, sem PII.
- segredos de webhook fora do código;
- webhook com assinatura + replay protection;
- RBAC para estorno, revisão e conciliação;
- nenhuma credencial real no pacote;
- logs sem PAN/CVV/tokens sensíveis.

## Homologação
1. duas leituras simultâneas do mesmo QR: apenas uma válida;
2. scanner não autorizado é recusado;
3. webhook duplicado não duplica conciliação/chargeback;
4. transação bancária ambígua vai para revisão;
5. chargeback bloqueia/reverte valores conforme estado;
6. estorno confirmado revoga ingresso e referencia lançamentos originais;
7. dashboard atualiza sem reload integral quando infraestrutura permitir;
8. nenhuma tela usa mock como dado real.
