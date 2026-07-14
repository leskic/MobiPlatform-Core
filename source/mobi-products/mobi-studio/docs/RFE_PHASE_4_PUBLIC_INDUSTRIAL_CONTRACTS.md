# RFE-STUDIO-PHASE4-001 — Public Industrial Integration Contracts

## Status

Pendente e bloqueante para a Fase 4 — Production Integration.

## Contexto

O Mobi Studio deve consumir exclusivamente contratos públicos do Mobi Constructor. A baseline certificada não oferece, pelo entrypoint público `mobi-products/mobi-constructor/src/index.ts`, os contratos exigidos pela fase.

## Contratos públicos necessários

1. `ProductionManifest`
   - identificador do projeto e da exportação;
   - estado e progresso da produção;
   - indicadores e relações por `PartID`;
   - versão explícita do contrato.

2. `BOMOutput`
   - linhas, totais, agrupamentos e rastreabilidade;
   - identidade estável das entidades navegáveis;
   - sem APIs de cálculo ou mutação.

3. `NeutralCAMPackage`
   - percursos e operações já calculados;
   - geometria de apresentação, layers e bounds;
   - relações entre operação, peça e entidade;
   - sem APIs de geração ou recálculo.

4. `ProductionFeedbackEvent`
   - timeline versionada;
   - `PartID`, timestamp lógico, status e telemetria;
   - contrato público de assinatura read-only.

5. `IndustrialTransactionPort`
   - comandos públicos para `EXPORT_STARTED`, `EXPORT_COMPLETED` e `INDUSTRIAL_VIEWED`;
   - execução exclusiva pelo TransactionCoordinator;
   - resultado, falha e identidade transacional tipados.

## Evidência na baseline

- `mobi-products/mobi-constructor/src/index.ts` não exporta módulos industriais, BOM, CAM ou Feedback Loop.
- `IndustrialTypes.ts` e `Phase3Types.ts` estão sob caminhos internos do produto.
- O `CAMArtifact` interno possui apenas formato, projeto e `payload: readonly string[]`; a implementação atual gera payload vazio e não oferece percursos renderizáveis.
- `RFE-STABILITY-002` e `RFE-STABILITY-003` já registram a ausência de portas públicas de transação e eventos.

## Critérios de aceite

- contratos versionados exportados por entrypoint público estável;
- documentação de compatibilidade e lifecycle;
- adapters oficiais, sem import de internals;
- teste de contrato consumível por produtos;
- preservação da imutabilidade da Plataforma e do Constructor congelado.

## Decisão

Nenhum DTO duplicado, adapter para internal, parser de payload ou acesso direto foi implementado. Production Dashboard, BOM Viewer, CAM Visualizer, Telemetry Monitor e os registros transacionais permanecem bloqueados até aprovação e entrega deste RfE.
