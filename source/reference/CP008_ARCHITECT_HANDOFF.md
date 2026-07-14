# CP008 Architect Handoff - First Reference Project

## Artifact Location

```text
source/reference/ProjetoReferencia.mobi
```

Supporting documentation:

```text
source/reference/ProjetoReferencia_README.md
source/reference/ProjetoReferencia_EXPECTED_RESULTS.md
```

## Reference Scenario

The reference project models a compact validated kitchen:

- Client: `Cliente Referência`.
- Environment: `Cozinha Referência`.
- 4 walls.
- 1 door opening.
- 1 window opening.
- Electrical, water and sewer points.
- Lower module, wall module, tower and countertop.
- Parts and hardware sufficient for BOM and CAM generation.

## Human Test Script for Charles

1. Start the executable Studio host:

   ```bash
   cd source/apps/mobi-studio-host
   npm install
   npm run dev
   ```

2. Open:

   ```text
   http://127.0.0.1:5173/
   ```

3. Click `Abrir Projeto.mobi`.

4. Select:

   ```text
   source/reference/ProjetoReferencia.mobi
   ```

5. Click `Executar Fluxo`.

6. Validate the visible result:

   - Project name: `Projeto Referência`.
   - Project id: `8f5d3e5c-7c1a-4a2f-9a11-02d3b75f1000`.
   - Status: approved.
   - Executed products include Mobi Studio, MobiConstructor, Industrial Validation and MobiView.
   - Evidence includes project loaded, schema validated, constructor executed, snapshot certified and MobiView executed.
   - Diagnostics show no blocking errors.

7. Register final approval or the observed error.

## Automated Validation

Run from `source`:

```bash
npm run build
npm test
```

Focused CP008 test:

```bash
npx vitest run reference/tests/reference-project.test.ts
```

## Expected Result

`ProjetoReferencia.mobi` should pass:

`schema valid -> Studio Host load -> FlowRunner -> Constructor -> Industrial Validation -> MobiView -> PASS`

## Architectural Notes

- The project uses only the official schema.
- No new schema version was created.
- No extra top-level fields were added.
- The client is stored in the official `metadata` extension point.
- The tests consume public APIs only.

