# Cross-Product Coupling Audit

## Resultado

O Patch de Estabilidade removeu 39 imports proibidos distribuídos em 24 arquivos da baseline. A varredura final de `src` e `tests` dos dois produtos encontrou zero imports cruzados.

## Imports removidos

| Origem acoplada | Ocorrências |
|---|---:|
| `builder/types/ProjectTypes` | 10 |
| `builder/ProjectBuilder` | 6 |
| `builder/tests/fixture` | 6 |
| `apps/mobi-studio/src/editor/EditIntent` | 4 |
| `apps/mobi-studio/src/transactions/TransactionCoordinator` | 2 |
| `apps/mobi-studio/src/interfaces/StudioApplicationTypes` | 1 |
| `apps/mobi-cognitive-analyzer/src/DiagnosticTypes` | 3 |
| `apps/mobi-cognitive-engine/src/PropositionTypes` | 4 |
| `apps/mobi-cognitive-autofix/src/AutoFixTypes` | 3 |

Arquivos afetados: 12 do Studio e 12 do Constructor, incluindo produção e testes. Fixtures do builder foram substituídas por fixtures próprias de cada produto.

## Contratos e portas locais criados

- Studio: `ProjectReadModel.ts` e `CognitiveDTOs.ts`.
- Constructor: `ProjectReadModel.ts` e `TransactionPort.ts`.
- Transaction Bridge e adapters cognitivos/industriais agora dependem de comandos e portas locais.
- Nenhum contrato público congelado foi criado ou alterado.

## Garantias

- Nenhum acesso direto ao Origin.
- Nenhuma alteração em Foundation, Schema, RuleSets, Production, CAM ou G-Code.
- Nenhum import entre Mobi Studio e Mobi Constructor.
- Teste arquitetural executável incluído na regressão.
