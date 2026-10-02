# Mapa de Cenários & Horizontes Temporais de Liquidez
## EDDIE 11.26 — Cash Forecast & Working Capital OS

### 1. Parâmetros dos Cenários de Estresse

| Parâmetro | Cenário BASE | Cenário CONSERVADOR | Cenário OTIMISTA | Cenário CUSTOMIZADO |
|---|:---:|:---:|:---:|:---:|
| **Curva de Bilheteria** | 100% nominal | -20% sell-out | +20% sell-out | Paramétrico (-50% a +50%) |
| **Estornos CDC Art. 49** | Histórico (~2,1%) | +30% de volume | -15% de volume | Paramétrico (0% a +100%) |
| **Prazo Adquirente** | Contratual (D+30) | Atraso de +5 dias | Antecipação D+2 | Paramétrico (-10 a +20 dias) |
| **Reserva de Segurança** | R$ 250.000,00 | R$ 250.000,00 | R$ 250.000,00 | R$ 250.000,00 |

---

### 2. Decomposição por Horizonte de Tempo

```
Hoje (D0)
  ├──> D+1  : Pix e TEDs imediatos; fechamento de lotes CNAB
  ├──> D+7  : Liquidação semanal de fornecedores e adiantamentos
  ├──> D+15 : Apuração quinzenal e conciliação de adquirentes
  ├──> D+30 : Entrada de recebíveis de cartão e folha operacional
  ├──> D+60 : Curva intermediária de eventos e festivais sazonais
  └──> D+90 : Planejamento estratégico de liquidez e capital de giro
```

---

### 3. Fórmulas de Working Capital (Capital de Giro)

- **Prazo Médio de Recebimento (PMR)**: 14 dias (ponderado entre Pix D+0 e Cartão D+30).
- **Prazo Médio de Pagamento (PMP)**: 22 dias (contratos com produtores e prestadores).
- **Ciclo Financeiro**:
  $$\text{Ciclo Financeiro} = \text{PMR} - \text{PMP} = 14 - 22 = -8\text{ dias}$$
- **Necessidade de Capital de Giro (NCG)**: R$ 450.000,00.
- **Folga de Liquidez**:
  $$\text{Folga} = \text{Saldo Disponível} - \text{NCG}$$
