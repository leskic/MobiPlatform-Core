# CP016 Architect Handoff

## Checkpoint

CP016 - Environment Editor Foundation

## User Capability Added

The operator can now create, rename, delete, list, and select environments directly in the Mobi Studio Host before generating a Projeto.mobi.

## Human Validation Script

1. Install dependencies from `source` if needed:
   `npm install`
2. Start the Host:
   `npm run dev --prefix apps/mobi-studio-host`
3. Open:
   `http://127.0.0.1:5173/`
4. Click `Novo Projeto`.
5. Confirm the Environment Editor starts empty.
6. Click `Adicionar Ambiente`.
7. Rename the active environment.
8. Add another environment.
9. Select each environment from the list.
10. Delete one environment.
11. Generate Projeto.mobi.
12. Open the generated/downloaded Projeto.mobi and confirm the environment list is preserved.

## Expected Result

- No previous project data remains after `Novo Projeto`.
- Environments can be organized without JSON editing.
- Generated Projeto.mobi contains the configured environments.
- Opening a Projeto.mobi updates the Environment Editor list automatically.
- Wall, Door, Parts, Constructor, MobiView, and FlowRunner behavior remains unchanged.

## Commands Used

- `npm run build --prefix apps/mobi-studio-host`
- `npm test --prefix apps/mobi-studio-host`
- `npm run build`
- `npm test`

## Scope Guard

This checkpoint only establishes environment organization in the Host. It does not create automatic walls, doors, windows, modules, Parts, BOM, CAM, production, or external integrations.
