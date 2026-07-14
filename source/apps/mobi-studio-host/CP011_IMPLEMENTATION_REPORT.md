# CP011 Implementation Report - Door Editing Journey

## Checkpoint

CP011 - Insert and edit doors on existing walls.

## User Journey

After this delivery, the user can:

`Novo Projeto -> Criar paredes -> Inserir porta -> Mover porta -> Editar largura/altura -> Salvar -> Projeto.mobi -> FlowRunner -> APPROVED`

No manual JSON editing is required.

## Base

- Base branch: `checkpoint/cp010-wall-editor`
- Work branch: `checkpoint/cp011-door-editor`
- Base SHA: `77d85e209aef6fad3f85ed73a58643b187024677`

## Scope Implemented

Implemented the door editing journey inside Mobi Studio Host:

- Door Editor
- Door Renderer
- Door Inspector
- Door Serializer
- Door Commands
- Door Selection

## Capabilities

- Insert door on an existing wall.
- Select door.
- Move door along the wall with snap.
- Edit width.
- Edit height.
- Delete door.
- Undo.
- Redo.
- Serialize door into official `Architecture` opening records.
- Save/regenerate a valid `Projeto.mobi`.
- Execute the generated project through the existing platform flow.

## Files Added

- `src/doors/DoorModel.ts`
- `src/doors/DoorCommands.ts`
- `src/doors/DoorRenderer.ts`
- `src/doors/DoorSelection.ts`
- `src/doors/DoorSerializer.ts`
- `src/ui/DoorInspector.ts`
- `tests/door-editor.test.ts`

## Files Updated

- `src/App.ts`
- `src/AppState.ts`
- `src/SimpleKitchenProjectFactory.ts`
- `src/ui/StudioShellView.ts`
- `src/styles.css`
- `package.json`

## Validation Coverage

Automated tests cover:

- Door creation.
- Door selection.
- Door movement along wall.
- Door width and height editing.
- Door deletion.
- Undo.
- Redo.
- Rendering.
- Serialization into official opening architecture records.
- Complete journey execution through MobiView.

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

The user can place the first real architectural opening visually, without editing JSON, while preserving the existing approved execution chain.

## Limitations

- CP011 implements only doors.
- Windows, furniture editing, electrical editing, hydraulic editing and automatic environments remain out of scope.
- Door placement is constrained to existing walls.
- No public contracts, schema versions, Foundation, Products Layer, MIC or Constitution files were changed.

