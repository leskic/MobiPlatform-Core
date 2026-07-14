# CP008 Implementation Report - First Reference Project

## Checkpoint

CP008 - First Reference Project

## Base

- Base branch: `checkpoint/cp007-executable-studio`
- Work branch: `checkpoint/cp008-reference-project`
- Base SHA: `0556bed682783098e8fc542861b384e70f06767d`

## Scope Implemented

Created the first official reference `Projeto.mobi` for the Mobi Platform:

```text
source/reference/ProjetoReferencia.mobi
```

Documentation added:

```text
source/reference/ProjetoReferencia_README.md
source/reference/ProjetoReferencia_EXPECTED_RESULTS.md
```

Automated tests added:

```text
source/reference/tests/reference-project.test.ts
```

## Project Contents

- Client: `Cliente Referência`, stored in the official `metadata` extension point.
- Environment: `Cozinha Referência`.
- Architecture: 4 walls, 1 door opening, 1 window opening.
- Infrastructure: electrical, water and sewer points.
- Furniture: 1 lower module, 1 wall module, 1 tower, 1 countertop.
- Parts: 8 parts.
- Hardware: 5 hardware items.

## Validation Coverage

The CP008 automated test validates:

- Official schema parsing through `ProjectParser`.
- Mobi Studio Host loading through `ProjectFileLoader`.
- `FlowRunner` execution.
- Constructor industrial snapshot generation.
- ProductionManifest presence.
- BOM generation.
- CAM generation.
- Industrial certification through `IndustrialValidationRunner`.
- MobiView snapshot return.
- Full `RealProjectRunner` approval.

## Commands

From `source`:

```bash
npm run build
npm test
npx vitest run reference/tests/reference-project.test.ts
```

## Human Command

```bash
cd source/apps/mobi-studio-host
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Select:

```text
source/reference/ProjetoReferencia.mobi
```

Then click `Executar Fluxo`.

## Limitations

- The client is represented through the schema's official `metadata` extension point because the frozen public schema has no first-class `client` field.
- No schema fields, public contracts, Foundation, Products Layer, MIC, or Constitution files were changed.

