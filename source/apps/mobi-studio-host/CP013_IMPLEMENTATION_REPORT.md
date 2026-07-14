# CP013 Implementation Report - Parts Foundation

## Checkpoint

CP013 - Parts Foundation

## User Journey

After this delivery, the user can inspect the physical parts already present in a `Projeto.mobi`, grouped by their modules, before any industrial outputs are generated.

## Scope Implemented

Implemented a small Parts Foundation view inside the Host:

- Unique part identification.
- Association between part and module.
- Basic part type/category.
- Primary dimensions.
- Material id when available.
- Integration with the existing public `Projeto.mobi` shape.

## Explicitly Out of Scope

- BOM.
- Cutting plan.
- CAM.
- Optimization.
- Production generation.
- Costs.

## Files Added

- `src/PartsFoundationViewModel.ts`
- `src/ui/PartsFoundationView.ts`
- `tests/parts-foundation.test.ts`

## Files Updated

- `src/App.ts`
- `src/AppState.ts`
- `src/ui/StudioShellView.ts`
- `src/styles.css`
- `tests/*.test.ts` only where `AppState` needed the new parts foundation field.
- `package.json`

## Validation Coverage

Automated tests cover:

- Parts extraction from `Projeto.mobi`.
- Module association.
- Basic part properties.
- Dimensions and material.
- View rendering.
- Empty state rendering.
- Exclusion of out-of-scope industrial outputs.

## Commands

From `source`:

```bash
npm run build
npm test
```

From `source/apps/mobi-studio-host`:

```bash
npm run build
npm test
npm run dev
```

Expected local URL:

```text
http://127.0.0.1:5173/
```

## User Value Delivered

The user can validate the first physical part layer of a project without entering industrial production workflows.

## Limitations

- The view is read-only.
- No BOM or production logic was introduced.
- No public contracts, schema versions, Foundation, Products Layer, MIC or Constitution files were changed.

