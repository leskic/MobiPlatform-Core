import { describe, expect, it } from "vitest";
import { ExecutionController } from "../src/ExecutionController";
import { DoorCommands } from "../src/doors/DoorCommands";
import { emptyDoorEditorState } from "../src/doors/DoorModel";
import { DoorRenderer } from "../src/doors/DoorRenderer";
import { DoorSelection } from "../src/doors/DoorSelection";
import { DoorSerializer } from "../src/doors/DoorSerializer";
import { normalizeDraft } from "../src/NewProjectDraft";
import { ProjectFileLoader } from "../src/ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "../src/SimpleKitchenProjectFactory";
import { StudioShellView } from "../src/ui/StudioShellView";
import { WallSerializer } from "../src/walls/WallSerializer";
import { defaultFourWallState } from "../src/walls/WallModel";

const walls = defaultFourWallState();
const draft = normalizeDraft({
  projectName: "Cozinha com Porta",
  clientName: "Cliente Porta",
  environmentName: "Cozinha",
  projectCode: "PRJ-PORTA",
});

describe("CP011 Door Editor journey", () => {
  it("creates a door attached to an existing wall", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    const state = commands.addDoor(walls, { wallId: "wall-1", offset: 630, width: 820 });

    expect(state.doors).toHaveLength(1);
    expect(state.selectedDoorId).toBe("door-1");
    expect(state.doors[0]).toMatchObject({ wallId: "wall-1", offset: 650, width: 800, height: 2100 });
  });

  it("selects doors through DoorSelection", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    const state = commands.addDoor(walls, { wallId: "wall-1" });

    expect(new DoorSelection().selected(state)?.id).toBe("door-1");
    expect(new DoorSelection().selected({ ...state, selectedDoorId: "missing" })).toBeNull();
  });

  it("moves a door along its wall with snap", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    commands.addDoor(walls, { wallId: "wall-1", offset: 600 });
    const moved = commands.moveSelected(77, walls);

    expect(moved.doors[0]?.offset).toBe(700);
  });

  it("edits door width and height", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    commands.addDoor(walls, { wallId: "wall-1" });
    const edited = commands.editSelected({ width: 930, height: 2140 }, walls);

    expect(edited.doors[0]).toMatchObject({ width: 950, height: 2150 });
  });

  it("deletes doors and supports undo and redo", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    commands.addDoor(walls, { wallId: "wall-1" });
    commands.addDoor(walls, { wallId: "wall-2" });
    expect(commands.deleteSelected().doors).toHaveLength(1);
    expect(commands.undo().doors).toHaveLength(2);
    expect(commands.redo().doors).toHaveLength(1);
  });

  it("serializes doors as official opening architecture objects", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    const doors = commands.addDoor(walls, { wallId: "wall-1", offset: 600, width: 800, height: 2100 });
    const wallSerializer = new WallSerializer();
    const openings = new DoorSerializer().toArchitectures(doors, walls, "9d0e6a20-12a2-4f5f-bd3a-000000000901", wallSerializer.architectureIdByWall(walls));

    expect(openings).toHaveLength(1);
    expect(openings[0]).toMatchObject({
      type: "opening",
      hostId: "9d0e6a20-12a2-4f5f-bd3a-000000000911",
      size: { width: 800, height: 2100, depth: 150 },
    });
  });

  it("renders door markers", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    const doors = commands.addDoor(walls, { wallId: "wall-1" });
    const html = new DoorRenderer().render(doors, walls);

    expect(html).toContain("data-door-id=\"door-1\"");
    expect(html).toContain("door-marker selected");
  });

  it("renders Door Editor controls in the Studio shell", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    const html = new StudioShellView().render({
      status: "creating-project",
      project: null,
      draft,
      wallEditor: walls,
      doorEditor: commands.addDoor(walls, { wallId: "wall-1" }),
      technicalDocumentation: null,
      partsFoundation: null,
      execution: null,
      message: null,
    });

    expect(html).toContain("Door Editor");
    expect(html).toContain("Inserir Porta");
    expect(html).toContain("Aplicar porta");
  });

  it("generates a valid Projeto.mobi with a serialized door", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    const doorState = commands.addDoor(walls, { wallId: "wall-1", offset: 600, width: 800, height: 2100 });
    const source = new SimpleKitchenProjectFactory().createJson(draft, walls, doorState);
    const loaded = new ProjectFileLoader().loadText(source, "PRJ-PORTA.mobi");

    expect(loaded.success).toBe(true);
    if (loaded.success) {
      const architectures = loaded.project.project.environments[0]?.architectures ?? [];
      expect(architectures.filter((item) => item.type === "wall")).toHaveLength(4);
      expect(architectures.filter((item) => item.type === "opening")).toHaveLength(1);
    }
  });

  it("executes the complete door editing journey through MobiView", () => {
    const commands = new DoorCommands(emptyDoorEditorState());
    const doorState = commands.addDoor(walls, { wallId: "wall-1", offset: 600, width: 800, height: 2100 });
    const source = new SimpleKitchenProjectFactory().createJson(draft, walls, doorState);
    const loaded = new ProjectFileLoader().loadText(source, "PRJ-PORTA.mobi");
    if (!loaded.success) throw new Error(loaded.message);

    const result = new ExecutionController().execute(loaded.project);

    expect(result.success).toBe(true);
    expect(result.viewModel?.status).toBe("APPROVED");
    expect(result.viewModel?.productsExecuted).toContain("MobiView");
  });
});

