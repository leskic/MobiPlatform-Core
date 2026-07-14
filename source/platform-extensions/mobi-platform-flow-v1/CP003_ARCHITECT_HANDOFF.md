# CP003 - Flow Integration - Architect Handoff

## State

CP003 is implemented and validated.

## Public Flow

`Projeto.mobi`

-> `FlowRunner`

-> `StudioApplication`

-> `MobiConstructorPublicFlow`

-> `IndustrialContractSnapshot`

-> `MobiViewIntegration`

-> `FlowExecutionResult`

## Human Test Handoff

1. Projeto.mobi used:
   - The automated suite builds a real Projeto.mobi with `ProjectBuilder` using project, environment, architecture, infrastructure, module, part, and hardware fixtures.
   - Fixture source: `builder/tests/fixture.ts`.

2. Exact command to execute CP003 tests:
   - `npm run build`
   - `npx vitest run platform-extensions/mobi-platform-flow-v1/tests/flow-runner.test.ts`
   - `npm test`
   - `npm run coverage`

3. Expected result:
   - `FlowExecutionResult.success === true`
   - `FlowExecutionResult.status === "APPROVED"`
   - `FlowExecutionResult.projectId` equals the Projeto.mobi project id.
   - `FlowExecutionResult.viewSnapshot.production.progress === 100`.

4. Product evidence:
   - Studio evidence: report includes `Mobi Studio opened with ... scene nodes`.
   - Constructor evidence: report includes `MobiConstructor public flow executed`.
   - Industrial snapshot evidence: report includes `Industrial snapshot validated`.
   - MobiView evidence: report includes `MobiView received industrial snapshot` and `MobiView return validated`.

5. Timings:
   - `FlowExecutionResult.timings` contains `LOAD_PROJECT`, `VALIDATE_SCHEMA`, `OPEN_STUDIO`, `RUN_CONSTRUCTOR`, `GENERATE_SNAPSHOT`, `DELIVER_MOBI_VIEW`, `VALIDATE_VIEW`, and `CLEANUP`.
   - `FlowExecutionResult.report.totalDurationMs` aggregates all step durations.

6. Invalid project behavior:
   - Invalid JSON fails with a structured error and no downstream product execution.
   - Schema-invalid Projeto.mobi fails with `SCHEMA_ERROR`.
   - Cleanup is attempted after every failure.

7. Final report location:
   - In-memory at `FlowExecutionResult.report`.
   - Implementation report: `platform-extensions/mobi-platform-flow-v1/CP003_IMPLEMENTATION_REPORT.md`.

## Architectural Guarantees

- No changes to Constituição, Projeto.mobi, Foundation, Products Layer, Cognitive Layer, MIC, or public contracts.
- Constructor is consumed through `mobi-products/mobi-constructor/src/index`.
- MobiView is consumed through `mobi-products/mobi-view/src/index`.
- Mobi Studio is consumed through `mobi-products/mobi-studio/src/index`.
- CP003 source has no imports from internal Constructor, MobiView, or Mobi Studio implementation directories.

## Next Action

Open a Pull Request from `checkpoint/cp003-flow-integration` into `checkpoint/cp002-production-integration`.

Do not start CP004 until CP003 commit, push, and PR are complete.
