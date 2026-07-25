# Status das Branches de Checkpoint

Atualizado em: 2026-07-16 (tarde)

Formato: cada linha é uma branch de checkpoint. `Autor` é quem implementou
(Work ou Claude Code), não quem decidiu o escopo. `Status` usa um vocabulário
fixo: `EM_PROGRESSO`, `READY_FOR_TECHNICAL_REVIEW`, `READY_FOR_HUMAN_TEST`,
`FROZEN`, `BLOCKED`.

Este arquivo cobre branches a partir da criação deste protocolo
(2026-07-16). O histórico anterior (CP001-CP016 Platform, CP001-CP007
Copilot, Adapter Lab CP001, etc.) já está documentado em
`PROJETO_MOBI/docs/` fora do repositório e não foi retroativamente
catalogado aqui para não gerar trabalho sem valor real.

| Branch | Autor | Escopo | Status | Commit |
|---|---|---|---|---|
| `checkpoint/cp017-dinabox-adapter-preflight` | Claude Code | CP017-001: Dinabox preflight readiness (DinaboxPreflight, reaproveita ExtractionPipeline) | READY_FOR_TECHNICAL_REVIEW | `824acde` |
| `checkpoint/coordenacao-workflow-setup` | Claude Code | Cria COORDENACAO/ (este protocolo) | FROZEN | `b2652bf` |
| `checkpoint/cp-gestor-001-foundation` | Claude Code | CP001 Mobi Gestor: cadastro de Cliente, cadastro de Projeto vinculado, painel de Atenção (atrasado/parado), layout com craft real. Ver `apps/mobi-gestor/ROADMAP.md` para fases futuras. | READY_FOR_TECHNICAL_REVIEW | `3ef33fa` |
| `checkpoint/cp-gestor-002-comercial` | Claude Code | CP002 Mobi Gestor: Orçamento por projeto (valor, desconto, margem, comissão), status Aberto/Negociando/Aprovado/Perdido com motivo, KPI "em negociação" no topbar. Auto-revisado (ver `COORDENACAO/CLAUDE_CODE/CP-GESTOR-SELF_REVIEW.md`, todos os achados endereçados) e suposições registradas em `apps/mobi-gestor/ROADMAP.md` — revisar antes de aprovar. | READY_FOR_TECHNICAL_REVIEW | `f6599a5` |
| `checkpoint/coordenacao-testes-resultados` | Claude Code | Cria `COORDENACAO/TESTES_RESULTADOS/` — central de registro de teste humano real (SketchUp/navegador), complementar aos handoffs de implementação. Primeiro registro: saga completa do bug CP004 "Undo operation already open" (HOTFIX001-006, Mobi Origin). | EM_PROGRESSO | (este commit) |
| `checkpoint/cp-gestor-006-compras-estoque` | Claude Code | CP006 Mobi Gestor: Compras e estoque (ItemEstoque, MovimentoEstoque ENTRADA/SAIDA, guarda contra quantidade negativa, painel de atenção estendido pra itens abaixo do mínimo). Escopo confirmado com Charles antes de implementar (estoque próprio com mínimo, não vinculado a ItemLevantamento). Testado ao vivo no navegador, ver `COORDENACAO/CLAUDE_CODE/CP-GESTOR-006_HANDOFF.md`. | READY_FOR_TECHNICAL_REVIEW | (pendente commit) |

## Como adicionar uma linha

1. Crie sua branch a partir da branch-base correta (confira `06_ARCHITECTURAL_RULES.md` / a branch mais atual conhecida).
2. Implemente o escopo do checkpoint.
3. Antes de commitar, adicione uma linha nesta tabela.
4. Commit único com o escopo + a atualização deste arquivo juntos.
5. Se o status mudar depois (ex.: revisão aprovou, virou FROZEN), edite a
   linha existente em vez de criar uma nova.
