# CP007 Architect Handoff - Executable Mobi Studio

## Objective

Provide the first executable browser host for Mobi Studio so a user can open a real `Projeto.mobi`, execute the integrated platform chain, and inspect the visual result and execution report.

## Application Location

`source/apps/mobi-studio-host`

## Install and Run

From the application directory:

```bash
cd source/apps/mobi-studio-host
npm install
npm run dev
```

Expected local URL:

```text
http://127.0.0.1:5173/
```

## Human Test Script for Charles

1. Install dependencies:

   ```bash
   cd source/apps/mobi-studio-host
   npm install
   ```

2. Start the application:

   ```bash
   npm run dev
   ```

3. Open the local URL in a browser:

   ```text
   http://127.0.0.1:5173/
   ```

4. Click `Abrir Projeto.mobi`.

5. Select a valid real `Projeto.mobi` JSON file.

6. Confirm that the project name, project id, and file name appear in the Projeto panel.

7. Click `Executar Fluxo`.

8. Validate the status panel:

   - Status should become `approved` for a valid complete project.
   - Durations by step should be visible.
   - Executed products should include `FlowRunner`, `Mobi Studio`, `MobiConstructor`, `Industrial Validation`, and `MobiView`.

9. Validate the MobiView panel:

   - The panel should show the rendered project id.
   - The status should be `LOADED` when the view snapshot is returned.

10. Validate evidences:

   - `PROJECT_LOADED`
   - `SCHEMA_VALIDATED`
   - `STUDIO_STARTED`
   - `CONSTRUCTOR_EXECUTED`
   - `SNAPSHOT_PRODUCED`
   - `SNAPSHOT_CERTIFIED`
   - `MOBI_VIEW_EXECUTED`
   - `FLOW_CLOSED`

11. Validate diagnostics:

   - A successful project should have no blocking industrial diagnostics.
   - Invalid projects should show the returned error or rejection diagnostics.

12. Register final human approval or the observed error.

## Expected Result

A valid project should complete the full chain:

`Projeto.mobi -> Mobi Studio Host -> RealProjectRunner -> EndToEndRunner -> FlowRunner -> MobiConstructor -> Industrial Validation -> MobiView -> Execution Summary`

The UI should display:

- Project identification.
- Final status.
- Step timings.
- Executed products.
- Evidence list.
- Diagnostics list.
- MobiView result.
- Final execution report.

## Validation Commands

From `source`:

```bash
npm run build
npm test
```

From `source/apps/mobi-studio-host`:

```bash
npm run build
npm test
```

## Architectural Notes

- The host does not duplicate industrial validation, constructor, flow, or viewer logic.
- The host does not create a new public contract.
- The host uses `RealProjectRunner` as the execution boundary.
- Project validation uses the existing `ProjectParser`.
- MobiView information is displayed from the returned view snapshot.
- All execution artifacts remain in memory.

## Import Boundary Audit

The CP007 source was audited for forbidden imports:

- No direct `mobi-constructor/src` import.
- No direct `mobi-view/src` import.
- No direct non-public Mobi Studio internals import.
- No direct industrial engine internals import.

## Known Limitations

- The interface is intentionally minimal for CP007 and is not a final product UI.
- The host requires a user-selected local file; no persistence or project library was added.
- Publishing and Pull Request creation require GitHub credentials available to the environment.
