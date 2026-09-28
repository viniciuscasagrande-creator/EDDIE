# Evidências End-to-End e Trilha de Auditoria
## Gestão de Usuários, RBAC & Segregação de Visões

---

### 1. Trilha de Auditoria de Criação e Alteração
```
[UsuariosService] Usuário Beatriz Lima (T4F) (beatriz.lima@t4f.com.br) criado por vinicius@diskingressos.com.br com papel PRODUTOR_ADMIN
[UsuariosService] Permissões do usuário usr-op-catraca atualizadas por admin-seguranca
[UsuariosService] Status do usuário Juliana Siqueira (Opus Entretenimento) (usr-prod-opus) alterado de ATIVO para BLOQUEADO por auditor-chefe: Suspeita de comprometimento de credenciais
[UsuariosService] Status do usuário Juliana Siqueira (Opus Entretenimento) (usr-prod-opus) alterado de BLOQUEADO para ATIVO por auditor-chefe: Troca de senha efetuada com 2FA revalidado
```

### 2. Validação da Alternância de Visões no Frontend
1. **Visão DiskIngressos Ativa:**
   - Menus visíveis: Todos os 18 módulos (incluindo Operação, Hardening, Contabilidade, Fechamento 11.24, Cash Forecast 11.26, Riscos 11.27, FP&A 11.28 e Usuários).
   - Badge no Header: `🏢 DiskIngressos (Admin Master)`.

2. **Visão Produtor Ativa (Ex: Live Nation Brasil):**
   - Menus visíveis: Apenas módulos permitidos à produtora (Visão Geral, Meus Eventos, Extrato & Repasses, Relatórios, SAC e Minha Equipe).
   - Módulos corporativos restritos ocultados na barra lateral.
   - Badge no Header: `🎭 Produtor: Live Nation Brasil Produções`.
