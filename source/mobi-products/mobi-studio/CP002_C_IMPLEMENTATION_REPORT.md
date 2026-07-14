# CP002-C — BOM Viewer — Implementation Report

## Baseline

- Repositório oficial: `https://github.com/leskic/MobiPlatform-Core.git`
- Branch: `main`
- Baseline inicial: `db2e0fc87a98c2d158b1ee08cda0d2609a2b9fd5`
- Checkpoints anteriores: CP002-A e CP002-B aprovados
- Contratos consumidos: `BOMOutput` e `PublicBOMLine` do MIC 1.1.0

## Componentes implementados

- `BOMViewerConsumer`: preserva snapshot, linhas, totais e grouping keys públicos;
- `BOMViewerViewModel`: projeção mínima de visualização;
- `BOMViewerState`: estado read-only e sequência de snapshot;
- `BOMViewerController`: conexão, atualização, desconexão, projeção e seleção;
- `BOMFilter`: busca, filtros e ordenação sobre cópias das linhas;
- `BOMGrouping`: agrupamento visual por kind ou key, sem totais derivados;
- `BOMSelectionBridge`: sincronização explícita por `sourceEntityId` com `SelectionController`.

## Comportamento

- listagem preserva integralmente os valores públicos de cada linha;
- busca considera `id`, `kind`, `key` e `sourceEntityIds`;
- filtros operam por `kind` e `key`;
- ordenação opera por `id`, `kind`, `key` ou `quantity`;
- agrupamentos organizam linhas sem somar quantidades, áreas ou volumes;
- seleção exige `sourceEntityId` explícito, pertencente à linha e visível no Scene Graph;
- desconexão limpa o estado visual e a seleção.

## Isolamento industrial

O BOM Viewer consome exclusivamente `BOMOutput` e `PublicBOMLine` pela fronteira pública do CP002-A.

Não existem imports ou acessos a:

- `ProductionManifest`;
- `NeutralCAMPackage`;
- `ProductionFeedbackStream`;
- `IndustrialTransactionPort`;
- `IndustrialContractSnapshot`;
- pipelines, providers, managers, builders ou engines do Constructor.

O Studio não recalcula, consolida nem modifica a BOM. Os totais do estado são cópias dos valores fornecidos por `BOMOutput.totals`.

## Testes

Foram adicionados nove testes:

1. BOM vazio;
2. BOM válido;
3. busca;
4. filtros;
5. agrupamentos;
6. ordenação;
7. sincronização de seleção;
8. `sourceEntityIds` inválidos;
9. imports arquiteturais.

## Validação

| Verificação | Resultado |
|---|---:|
| Build completo | aprovado |
| Studio TypeScript strict | aprovado |
| Regressão da Plataforma | 313/313 |
| CP001 e MIC | 43/43 |
| Constructor | 38/38 |
| Studio acumulado CP002-A–C | 61/61 |
| Cobertura global do Studio | 99,22/98,73/100/99,22 |
| Cobertura de `bom-viewer` | 100/100/100/100 |
| Fronteira arquitetural | aprovada |

## Fora do escopo

Não foram implementados CAM, Telemetria, novos Dashboards, cálculo de BOM ou qualquer funcionalidade de checkpoint posterior.

Bloqueios identificados: nenhum dentro do CP002-C.
