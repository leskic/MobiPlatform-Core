# CP004 - Industrial Validation - Architect Handoff

## State

CP004 is implemented and validated.

## Public Validation Flow

`IndustrialContractSnapshot`

-> `IndustrialValidationRunner`

-> `SnapshotValidator`

-> `ProductionConsistencyValidator`

-> `FlowDiagnostics`

-> `IndustrialValidationResult`

## Certification Contract

A snapshot is certified when:

- ProductionManifest has valid contract, MIC version, ids, completed state, progress, and part relations.
- BOM has valid contract, MIC version, project id, line ids, quantities, measures, and source references.
- CAM has valid contract, MIC version, project id, layer, bounds, paths, and operation path references.
- Feedback stream exposes public `snapshot` and `subscribe`, and each event is structurally valid.
- Transactions port exposes public `record`.
- Cross-contract consistency has no error diagnostics.

Warnings are retained in diagnostics but do not block certification.

## Human Test Handoff

1. Exact commands:
   - `npm run build`
   - `npx vitest run platform-extensions/mobi-platform-industrial-validation-v1/tests/industrial-validation.test.ts`
   - `npm test`

2. Expected result:
   - CP004 focused tests: 7/7 passing.
   - Full regression: 336/336 passing.
   - `IndustrialValidationResult.status === "CERTIFIED"` for a valid FlowRunner-produced snapshot.

3. Invalid behavior:
   - Manifest, BOM, CAM, and null snapshot errors produce `REJECTED`.
   - Diagnostics contain stage, severity, code, message, and optional entity.

4. Report location:
   - `platform-extensions/mobi-platform-industrial-validation-v1/CP004_IMPLEMENTATION_REPORT.md`

## Architectural Guarantees

- No changes to Constituição, Projeto.mobi, Foundation, Products Layer, MIC, or public contracts.
- Constructor is consumed only through `mobi-products/mobi-constructor/src/index`.
- CP004 does not import internal Constructor, Studio, Viewer, MIC implementation, or industrial generation modules.
- CP004 validates; it does not create, mutate, or recalculate industrial outputs.

## Next Action

Stop after CP004 as requested.

Do not start CP005.
