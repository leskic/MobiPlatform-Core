# ProjetoReferencia.mobi

`ProjetoReferencia.mobi` is the first official reference project for the Mobi Platform.

It is intentionally small, but complete enough to exercise the integrated platform chain:

`Projeto.mobi -> Mobi Studio Host -> RealProjectRunner -> FlowRunner -> MobiConstructor -> Industrial Validation -> MobiView`

## Contents

- 1 client registered through the official `metadata` extension point.
- 1 environment named `Cozinha Referência`.
- 4 walls.
- 1 door opening.
- 1 window opening.
- 1 electrical point.
- 1 water point.
- 1 sewer point.
- 1 lower module.
- 1 wall module.
- 1 tower.
- 1 countertop.
- Parts and hardware sufficient to generate BOM, CAM, ProductionManifest and industrial snapshot.

## File

```text
source/reference/ProjetoReferencia.mobi
```

## Human Execution

1. Start the host:

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

6. Validate that the status is approved and that MobiView displays the returned project snapshot.

## Automated Validation

From `source`:

```bash
npm run build
npm test
```

Focused CP008 test:

```bash
npx vitest run reference/tests/reference-project.test.ts
```

