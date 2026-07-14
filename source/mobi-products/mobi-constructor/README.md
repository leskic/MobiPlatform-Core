# Mobi Constructor 1.0.0

## MIC 1.1.0

O entrypoint público fornece o Provider MIC aprovado por `RFE-MIC-001`: Production Manifest, BOM Output, Neutral CAM Package, Production Feedback Stream e IndustrialTransactionPort. Consulte `MIC_IMPLEMENTATION_REPORT.md` e `MIC_HUMAN_TEST_HANDOFF.md`.

Primeiro produto consumidor da Plataforma Mobi. Esta fase entrega bootstrap, registro de dependências, leitura pública, pipeline determinístico, tradução para modelo interno e contratos de outputs futuros.

Nenhuma lógica industrial é executada. Os cinco outputs permanecem explicitamente desabilitados.

Validação: `npx tsc -p mobi-products/mobi-constructor/tsconfig.json --noEmit` e `npx vitest run --coverage --config mobi-products/mobi-constructor/vitest.config.ts`.
