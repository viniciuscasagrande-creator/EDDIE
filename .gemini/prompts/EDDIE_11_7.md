# EXECUÇÃO EDDIE 11.7

Implemente integralmente `EDDIE_11_7_OPERACAO_COMPLETA_EVENTO.md` sobre a baseline atual.

REGRAS RÍGIDAS:
- Não remover funcionalidades existentes.
- Não substituir a identidade visual do EDDIE.
- Não criar mocks como se fossem produção.
- Não alterar regras financeiras já homologadas.
- Toda UI em pt-BR.
- Todas as telas devem possuir loading, vazio, erro e sucesso.
- Preserve o Modo Evento e propague `eventoId`.
- Corrija imports/rotas/tipagens até o build passar.
- Não “resolver” build apagando componentes.

ROTAS FUNCIONAIS ESPERADAS:
- /eventos
- /eventos/novo
- /eventos/:eventoId/dashboard
- /eventos/:eventoId/ingressos
- /eventos/:eventoId/relatorios
- /eventos/:eventoId/detalhes
- /eventos/:eventoId/mapa
- /eventos/:eventoId/configuracao/sessoes
- /eventos/:eventoId/configuracao/setores
- /eventos/:eventoId/configuracao/lotes
- /eventos/:eventoId/cortesias

Ao finalizar:
1. execute install somente se necessário;
2. execute build do PDT e API;
3. execute lint/typecheck disponíveis;
4. valide as rotas;
5. liste arquivos alterados;
6. não faça push/deploy sem autorização explícita.
