# CP013 Architect Handoff - Parts Foundation

## Capability Delivered

Mobi Studio Host now displays a Parts Foundation section derived directly from the loaded/generated `Projeto.mobi`.

## Human Test Script

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

3. Create a project or open an existing `Projeto.mobi`.

4. Click `Gerar Projeto.mobi` if creating through the Host.

5. Inspect `Parts Foundation`:

   - Total parts is visible.
   - Each part has an ID.
   - Each part shows its module.
   - Type/category are visible.
   - Dimensions are visible.
   - Material id is visible when available.

6. Confirm out-of-scope outputs are not shown:

   - No BOM.
   - No CAM.
   - No cutting plan.
   - No costs.

7. Click `Executar Fluxo` and confirm the existing flow remains approved.

## Expected Result

`Projeto.mobi -> Parts Foundation -> ID, modulo, tipo, dimensoes e material visiveis`

## Automated Validation

Run from `source`:

```bash
npm run build
npm test
```

Focused host validation:

```bash
npm run test --prefix apps/mobi-studio-host
```

## Architecture Notes

- Parts data is derived from the existing public `Project` shape.
- No new public contract was introduced.
- No industrial calculations were added.
- BOM, CAM, costs and cutting plan remain out of scope.

