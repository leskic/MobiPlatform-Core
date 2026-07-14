# CP002 — Mobi Studio Phase 4 — Production Integration

## Baseline e escopo

- Repositório oficial: `https://github.com/leskic/MobiPlatform-Core.git`
- Branch: `main`
- Commit inicial: `db2e0fc87a98c2d158b1ee08cda0d2609a2b9fd5`
- Contratos consumidos: MIC `1.1.0`
- Produto alterado: exclusivamente `mobi-products/mobi-studio`

O CP002 implementa consumidores read-only. Nenhum módulo calcula BOM, CAM, produção, custos, pesos, tempos ou estimativas.

## CP002-A — Industrial Integration

### Arquivos

- `src/industrial-integration/IndustrialContracts.ts`
- `IndustrialConnectionState.ts`
- `IndustrialContractGuard.ts`
- `IndustrialIntegrationCoordinator.ts`
- `IndustrialLifecycle.ts`
- `tests/industrial-integration.test.ts`

### Decisões

- concentrar o único import do Constructor em `IndustrialContracts.ts`;
- importar somente o entrypoint público `mobi-constructor/src/index`;
- bloquear snapshot nulo, MIC incompatível, `projectId` inválido ou divergente e dupla conexão;
- expor estado read-only, sem substituir silenciosamente uma conexão ativa.

### Testes

7 testes. Cobertura do diretório: 100/100/100/100.

## CP002-B — Production Dashboard

### Arquivos

- `src/production-dashboard/ProductionDashboardConsumer.ts`
- `ProductionDashboardController.ts`
- `ProductionDashboardFormatter.ts`
- `ProductionDashboardState.ts`
- `ProductionDashboardViewModel.ts`
- `tests/production-dashboard.test.ts`

### Decisões

- consumir somente `ProductionManifest`;
- apresentar diretamente state, progress, partCount, version e exportId;
- apresentar `Indisponível` para Project Name, Produced/Pending/Failed Parts e Updated At;
- não contar relações de peças para preencher campos ausentes.

### Testes

8 testes. Cobertura do diretório: 97,74/97,67/100/97,74.

## CP002-C — BOM Viewer

### Arquivos

- `src/bom-viewer/BOMViewerConsumer.ts`
- `BOMViewerController.ts`
- `BOMViewerState.ts`
- `BOMViewerViewModel.ts`
- `BOMFilter.ts`
- `BOMGrouping.ts`
- `BOMSelectionBridge.ts`
- `tests/bom-viewer.test.ts`

### Decisões

- consumir somente `BOMOutput` e `PublicBOMLine`;
- busca, filtros, agrupamentos e ordenação trabalham sobre cópias;
- agrupamentos não produzem totais derivados;
- seleção exige `sourceEntityId` explícito pertencente à linha e visível no Scene Graph.

### Testes

9 testes. Cobertura do diretório: 100/100/100/100.

## CP002-D — CAM Visualizer

### Arquivos

- `src/cam-visualizer/CAMVisualizerConsumer.ts`
- `CAMVisualizerController.ts`
- `CAMVisualizerState.ts`
- `CAMVisualizerViewModel.ts`
- `CAMSelectionBridge.ts`
- testes em `tests/production-integration.test.ts`

### Decisões

- consumir exclusivamente `NeutralCAMPackage`, paths, operations e bounds públicos;
- preservar pontos e bounds sem recalcular trajetórias;
- visibilidade de layer é estado local de apresentação;
- inspeção e foco retornam operações e bounds já presentes no contrato;
- seleção usa `entityId` público e falha quando a entidade não está visível.

### Testes

Renderização, layers, inspeção, bounds, seleção, erro defensivo, atualização e desconexão. Cobertura: 100/98,07/100/100.

## CP002-E — Telemetry Monitor

### Arquivos

- `src/telemetry-monitor/TelemetryMonitorConsumer.ts`
- `TelemetryMonitorController.ts`
- `TelemetryMonitorState.ts`
- `TelemetryMonitorViewModel.ts`
- `TelemetryFilter.ts`
- testes em `tests/production-integration.test.ts`

### Decisões

- consumir somente `ProductionFeedbackStream` e `ProductionFeedbackEvent`;
- carregar o snapshot público e assinar eventos futuros;
- manter a ordem recebida do stream;
- permitir filtros locais por PartID, status, métrica e presença de telemetria;
- remover a assinatura e limpar o estado na desconexão.

### Testes

Histórico, assinatura, evento ao vivo, filtros, lifecycle e unsubscribe. Cobertura: 100/100/100/100.

## CP002-F — Production Integration ViewModel

### Arquivos

- `src/production-integration/ProductionIntegrationController.ts`
- `ProductionIntegrationViewModel.ts`
- testes em `tests/production-integration.test.ts`

### Decisões

- conectar um único `IndustrialContractSnapshot` validado pelo CP002-A;
- entregar Manifest, BOM, CAM e Feedback exclusivamente aos respectivos consumidores;
- agregar somente view models derivados;
- executar rollback local de conexão se um consumidor falhar durante a composição;
- não acessar nem executar `IndustrialTransactionPort` nesta fase visual.

### Testes

Composição, filtros, desconexão, incompatibilidade MIC, rollback e arquitetura. Cobertura: 100/100/100/100.

## CP002-G — Validação

| Verificação | Resultado |
|---|---:|
| Build completo | aprovado |
| TypeScript strict do Studio | aprovado |
| TypeScript strict do Constructor | aprovado |
| Regressão da Plataforma | 313/313 |
| CP001 e MIC | 43/43 |
| Constructor | 38/38 |
| Studio acumulado | 73/73 |
| Novos testes CP002 | 36/36 |
| Cobertura global Studio | 99,54/98,77/100/99,54 |
| Teste de fronteiras | aprovado |
| Imports internos do Constructor | 0 |
| Imports de Origin/Foundation/Transaction internals | 0 |
| Alterações fora do Mobi Studio | 0 |

## Riscos

- o MIC 1.1.0 não fornece Project Name, Updated At nem contagens Produced/Pending/Failed no Manifest;
- o Neutral CAM público contém somente geometria 2D e layer `CUT_OUTLINE` nesta versão;
- Manifest e BOM são snapshots, não streams; atualização exige novo snapshot público;
- apenas Feedback possui atualização contínua;
- seleção industrial depende de `entityId`/`sourceEntityId` existente no Scene Graph;
- o entrypoint público é consumido por caminho TypeScript do monorepo, não por pacote npm independente.

## Limitações

- componentes visuais são view models e renderer ports mínimos, sem layout ou estilos finais;
- não há geração/reprocessamento de BOM, CAM ou G-Code;
- não há alteração de status de fabricação ou telemetria;
- não há cálculo de custos, nesting, peso, tempo ou estimativas;
- nenhum comando transacional industrial é executado pelo ViewModel integrado;
- contratos ausentes não são simulados nem preenchidos por heurística.

## Resultado

CP002 concluído tecnicamente e pronto para auditoria. CP003 não foi iniciado.
