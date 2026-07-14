import { describe, expect, it } from "vitest";
import { ExecutionController } from "../src/ExecutionController";
import { emptyDoorEditorState } from "../src/doors/DoorModel";
import { normalizeDraft } from "../src/NewProjectDraft";
import { ProjectFileLoader } from "../src/ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "../src/SimpleKitchenProjectFactory";
import { StudioShellView } from "../src/ui/StudioShellView";
import { WallCommands, snap } from "../src/walls/WallCommands";
import { defaultFourWallState, emptyWallEditorState } from "../src/walls/WallModel";
import { WallRenderer } from "../src/walls/WallRenderer";
import { WallSelection } from "../src/walls/WallSelection";
import { WallSerializer } from "../src/walls/WallSerializer";

const draft = normalizeDraft({
  projectName: "Cozinha com Paredes",
  clientName: "Cliente Parede",
  environmentName: "Cozinha",
  projectCode: "PRJ-PAREDES",
});

describe("CP010 Wall Editor journey", () => {
  it("creates and selects a wall", () => {
    const commands = new WallCommands(emptyWallEditorState());
    const state = commands.addWall({ x: 12, y: 89, length: 1240 });

    expect(state.walls).toHaveLength(1);
    expect(state.selectedWallId).toBe("wall-1");
    expect(state.walls[0]).toMatchObject({ x: 0, y: 100, length: 1250 });
  });

  it("selects walls through WallSelection", () => {
    const state = defaultFourWallState();
    expect(new WallSelection().selected(state)?.id).toBe("wall-1");
    expect(new WallSelection().selected({ ...state, selectedWallId: "missing" })).toBeNull();
  });

  it("moves selected walls with grid snap", () => {
    const commands = new WallCommands(emptyWallEditorState());
    commands.addWall({ x: 0, y: 0 });
    const moved = commands.moveSelected(73, 76);

    expect(moved.walls[0]).toMatchObject({ x: 50, y: 100 });
    expect(snap(74)).toBe(50);
  });

  it("edits wall dimensions", () => {
    const commands = new WallCommands(emptyWallEditorState());
    commands.addWall();
    const edited = commands.editSelected({ length: 2475, thickness: 175, height: 2650, rotation: 90 });

    expect(edited.walls[0]).toMatchObject({ length: 2500, thickness: 200, height: 2650, rotation: 90 });
  });

  it("deletes walls and supports undo and redo", () => {
    const commands = new WallCommands(emptyWallEditorState());
    commands.addWall();
    commands.addWall();
    expect(commands.deleteSelected().walls).toHaveLength(1);
    expect(commands.undo().walls).toHaveLength(2);
    expect(commands.redo().walls).toHaveLength(1);
  });

  it("serializes walls into official Projeto.mobi architecture objects", () => {
    const architectures = new WallSerializer().toArchitectures(defaultFourWallState(), "9d0e6a20-12a2-4f5f-bd3a-000000000901");

    expect(architectures).toHaveLength(4);
    expect(architectures[0]).toMatchObject({
      type: "wall",
      size: { width: 3000, height: 2700, depth: 150 },
      position: { x: 0, y: 0, z: 0 },
    });
  });

  it("renders walls and the selected wall", () => {
    const html = new WallRenderer().render(defaultFourWallState());

    expect(html).toContain("data-wall-id=\"wall-1\"");
    expect(html).toContain("wall-line selected");
  });

  it("renders Wall Editor controls in the Studio shell", () => {
    const html = new StudioShellView().render({
      status: "creating-project",
      project: null,
      draft,
      wallEditor: defaultFourWallState(),
      doorEditor: emptyDoorEditorState(),
      technicalDocumentation: null,
      execution: null,
      message: null,
    });

    expect(html).toContain("Wall Editor");
    expect(html).toContain("Adicionar Parede");
    expect(html).toContain("Desfazer");
    expect(html).toContain("Refazer");
    expect(html).toContain("Aplicar parede");
  });

  it("generates a valid Projeto.mobi from four edited walls", () => {
    const commands = new WallCommands(emptyWallEditorState());
    commands.addWall({ x: 0, y: 0, length: 3000, rotation: 0 });
    commands.addWall({ x: 0, y: 2200, length: 3000, rotation: 180 });
    commands.addWall({ x: 0, y: 0, length: 2200, rotation: 90 });
    const wallState = commands.addWall({ x: 3000, y: 0, length: 2200, rotation: -90 });

    const source = new SimpleKitchenProjectFactory().createJson(draft, wallState);
    const loaded = new ProjectFileLoader().loadText(source, "PRJ-PAREDES.mobi");

    expect(loaded.success).toBe(true);
    if (loaded.success) {
      expect(loaded.project.project.environments[0]?.architectures.filter((item) => item.type === "wall")).toHaveLength(4);
    }
  });

  it("executes the complete wall editing journey through MobiView", () => {
    const commands = new WallCommands(emptyWallEditorState());
    commands.addWall({ x: 0, y: 0, length: 3000, rotation: 0 });
    commands.addWall({ x: 0, y: 2200, length: 3000, rotation: 180 });
    commands.addWall({ x: 0, y: 0, length: 2200, rotation: 90 });
    const wallState = commands.addWall({ x: 3000, y: 0, length: 2200, rotation: -90 });
    const source = new SimpleKitchenProjectFactory().createJson(draft, wallState);
    const loaded = new ProjectFileLoader().loadText(source, "PRJ-PAREDES.mobi");
    if (!loaded.success) throw new Error(loaded.message);

    const result = new ExecutionController().execute(loaded.project);

    expect(result.success).toBe(true);
    expect(result.viewModel?.status).toBe("APPROVED");
    expect(result.viewModel?.productsExecuted).toContain("MobiView");
  });
});
