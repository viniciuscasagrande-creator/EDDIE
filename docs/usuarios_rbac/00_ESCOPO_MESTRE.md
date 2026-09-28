# Gestão de Usuários, RBAC & Segregação de Visões (DiskIngressos vs Produtor)
## Documento Mestre de Arquitetura de Permissões e Multitenancy

---

### 1. Visão Geral e Contexto
O sistema opera com **Duas Visões Fundamentais**:

1. **Visão DiskIngressos (Administrador Geral & Operação Interna):**
   - Acesso irrestrito a todos os módulos da plataforma.
   - Visão global de todos os eventos, finanças, tesouraria, contabilidade, auditoria de 10 gates e FP&A.
   - Capacidade de acionar e destravar Circuit Breakers, ajustar limites de crédito e gerenciar usuários de todo o ecossistema.

2. **Visão Produtor (Produtora Parceira / Tenant B2B):**
   - Acesso estritamente isolado aos eventos e dados pertencentes à sua própria produtora (`producerId`).
   - Gestão de lotes, ingressos, mapa de assentos e portaria de seus eventos.
   - Acesso ao Portal do Produtor: extrato de conta gráfica, solicitações de repasse/adiantamento e comprovantes.
   - **Vedações Absolutas ao Produtor:**
     - Não pode visualizar dados de outras produtoras parceiras.
     - Não tem acesso aos orçamentos internos da DiskIngressos (FP&A - CC-100 a CC-500).
     - Não tem acesso à Contabilidade geral nem ao balancete/DRE consolidada da DiskIngressos.
     - Não tem acesso às ferramentas de trava global e risco sistêmico.

---

### 2. Papéis de Acesso (Roles)
- `ADMIN_DISKINGRESSOS`: Administrador Master com permissões totais.
- `FINANCEIRO_DISKINGRESSOS`: Gestor financeiro corporativo da DiskIngressos.
- `OPERADOR_DISKINGRESSOS`: Equipe de suporte operacional e atendimento da DiskIngressos.
- `PRODUTOR_ADMIN`: Gestor titular da produtora parceira (Live Nation, Opus, T4F, etc.).
- `PRODUTOR_OPERADOR`: Operador da produtora com foco em acompanhamento e portaria.
- `PORTARIA_CHECKIN`: Operador dedicado à validação de ingressos e catracas no evento.
