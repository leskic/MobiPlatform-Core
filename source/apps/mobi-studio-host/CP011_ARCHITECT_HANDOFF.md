# CP011 Architect Handoff - Door Editing Journey

## Capability Delivered

The user can insert and edit doors on existing walls in Mobi Studio Host, save the result into a valid `Projeto.mobi`, and execute the full chain until `APPROVED`.

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

3. Click `Novo Projeto`.

4. Use `Wall Editor` to confirm or create four walls.

5. Use `Door Editor`:

   - Click `Inserir Porta`.
   - Select a door marker.
   - Move it with `Voltar na parede` / `Avancar na parede`.
   - Edit `Posicao na parede`, `Largura` and `Altura`.
   - Click `Aplicar porta`.
   - Use `Desfazer Porta` and `Refazer Porta`.

6. Fill the project fields.

7. Click `Gerar Projeto.mobi`.

8. Confirm:

   - Project appears in the Projeto panel.
   - `Baixar Projeto.mobi` is visible.
   - No JSON was edited manually.

9. Click `Executar Fluxo`.

10. Validate:

   - Final status is approved.
   - MobiView receives the project.
   - Evidence includes schema validation, constructor execution, snapshot certification and MobiView execution.

## Expected Result

`Novo Projeto -> 4 paredes -> 1 porta -> Gerar Projeto.mobi -> Executar Fluxo -> APPROVED`

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

- Door editing state is local to the Host.
- Door serialization produces official `Architecture` records with `type: "opening"` and `hostId` pointing to an existing wall.
- Project generation still uses `ProjectBuilder`.
- Flow execution still uses `ExecutionController` and `RealProjectRunner`.
- No new public contract was introduced.

## Product Notes

This checkpoint deliberately implements only doors. Windows and other openings remain out of scope.

