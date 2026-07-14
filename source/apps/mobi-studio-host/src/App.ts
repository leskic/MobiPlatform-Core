import { ExecutionController, type ExecutionControllerResult } from "./ExecutionController";
import { initialAppState, type AppState } from "./AppState";
import { normalizeDraft, type NewProjectDraft } from "./NewProjectDraft";
import { ProjectFileLoader } from "./ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "./SimpleKitchenProjectFactory";
import { StudioShellView } from "./ui/StudioShellView";
import { TechnicalDocumentationFactory } from "./TechnicalDocumentationViewModel";
import { PartsFoundationFactory } from "./PartsFoundationViewModel";
import { defaultExpanded, PartsHierarchyFactory, toggleExpanded } from "./PartsHierarchyViewModel";
import { WallCommands } from "./walls/WallCommands";
import { defaultFourWallState, type WallDraft } from "./walls/WallModel";
import { DoorCommands } from "./doors/DoorCommands";
import { emptyDoorEditorState, type DoorDraft } from "./doors/DoorModel";

export class App {
  private state: AppState = initialAppState();
  private wallCommands = new WallCommands(this.state.wallEditor);
  private doorCommands = new DoorCommands(this.state.doorEditor);

  constructor(
    private readonly root: HTMLElement,
    private readonly loader = new ProjectFileLoader(),
    private readonly controller = new ExecutionController(),
    private readonly projectFactory = new SimpleKitchenProjectFactory(),
    private readonly technicalDocumentationFactory = new TechnicalDocumentationFactory(),
    private readonly partsFoundationFactory = new PartsFoundationFactory(),
    private readonly partsHierarchyFactory = new PartsHierarchyFactory(),
    private readonly view = new StudioShellView(),
  ) {}

  mount(): void {
    this.render();
  }

  snapshot(): AppState {
    return this.state;
  }

  async openProject(file: File): Promise<void> {
    const loaded = await this.loader.loadFile(file);
    if (!loaded.success) {
      this.state = Object.freeze({
        status: loaded.code === "SCHEMA_ERROR" ? "rejected" : "error",
        project: null,
        draft: this.state.draft,
        wallEditor: this.state.wallEditor,
        doorEditor: this.state.doorEditor,
        execution: null,
        technicalDocumentation: null,
        partsFoundation: null,
        partsHierarchy: null,
        message: `${loaded.code}: ${loaded.message}`,
      });
      this.render();
      return;
    }

    this.state = Object.freeze({
      status: "project-loaded",
      project: loaded.project,
      draft: this.state.draft,
      wallEditor: this.state.wallEditor,
      doorEditor: this.state.doorEditor,
      execution: null,
      technicalDocumentation: this.technicalDocumentationFactory.create(loaded.project.project),
      partsFoundation: this.partsFoundationFactory.create(loaded.project.project),
      partsHierarchy: this.partsHierarchyFactory.create(loaded.project.project),
      message: "Projeto.mobi carregado e validado.",
    });
    this.render();
  }

  startNewProject(): void {
    this.state = Object.freeze({
      ...this.state,
      status: "creating-project",
      wallEditor: this.state.wallEditor.walls.length > 0 ? this.state.wallEditor : defaultFourWallState(),
      doorEditor: this.state.doorEditor,
      execution: null,
      technicalDocumentation: this.state.technicalDocumentation,
      partsFoundation: this.state.partsFoundation,
      partsHierarchy: this.state.partsHierarchy,
      message: "Preencha os dados e gere uma Cozinha simples.",
    });
    this.render();
  }

  createProject(draftInput: Partial<NewProjectDraft>): void {
    const draft = normalizeDraft(draftInput);
    const source = this.projectFactory.createJson(draft, this.state.wallEditor, this.state.doorEditor);
    const loaded = this.loader.loadText(source, `${draft.projectCode}.mobi`);
    if (!loaded.success) {
      this.state = Object.freeze({
        status: "error",
        project: null,
        draft,
        wallEditor: this.state.wallEditor,
        doorEditor: this.state.doorEditor,
        execution: null,
        technicalDocumentation: null,
        partsFoundation: null,
        partsHierarchy: null,
        message: `${loaded.code}: ${loaded.message}`,
      });
      this.render();
      return;
    }

    this.state = Object.freeze({
      status: "project-loaded",
      project: loaded.project,
      draft,
      wallEditor: this.state.wallEditor,
      doorEditor: this.state.doorEditor,
      execution: null,
      technicalDocumentation: this.technicalDocumentationFactory.create(loaded.project.project),
      partsFoundation: this.partsFoundationFactory.create(loaded.project.project),
      partsHierarchy: this.partsHierarchyFactory.create(loaded.project.project),
      message: "Projeto.mobi criado visualmente e validado.",
    });
    this.render();
  }

  executeFlow(): ExecutionControllerResult {
    if (!this.state.project) {
      const result = Object.freeze({ success: false, viewModel: null, error: "PROJECT_NOT_LOADED" });
      this.state = Object.freeze({ ...this.state, status: "error", message: result.error });
      this.render();
      return result;
    }

    const project = this.state.project;
    this.state = Object.freeze({ ...this.state, status: "running", execution: null, message: "Executando cadeia integrada..." });
    this.render();
    const result = this.controller.execute(project);
    this.state = Object.freeze({
      status: result.success ? "approved" : result.viewModel ? "rejected" : "error",
      project: this.state.project,
      draft: this.state.draft,
      wallEditor: this.state.wallEditor,
      doorEditor: this.state.doorEditor,
      execution: result.viewModel,
      technicalDocumentation: this.state.technicalDocumentation,
      partsFoundation: this.state.partsFoundation,
      partsHierarchy: this.state.partsHierarchy,
      message: result.error ?? (result.success ? "Fluxo aprovado." : "Fluxo rejeitado."),
    });
    this.render();
    return result;
  }

  private render(): void {
    this.view.mount(this.root, this.state, {
      onProjectSelected: (file) => void this.openProject(file),
      onNewProject: () => this.startNewProject(),
      onCreateProject: (draft) => this.createProject(draft),
      onAddWall: () => this.updateWalls(this.wallCommands.addWall({ x: 100, y: 100 })),
      onSelectWall: (id) => this.updateWalls(this.wallCommands.selectWall(id)),
      onMoveWall: (dx, dy) => this.updateWalls(this.wallCommands.moveSelected(dx, dy)),
      onEditWall: (draft) => this.updateWalls(this.wallCommands.editSelected(draft)),
      onDeleteWall: () => {
        this.doorCommands = new DoorCommands(emptyDoorEditorState());
        this.updateWalls(this.wallCommands.deleteSelected(), emptyDoorEditorState());
      },
      onUndoWall: () => this.updateWalls(this.wallCommands.undo()),
      onRedoWall: () => this.updateWalls(this.wallCommands.redo()),
      onAddDoor: () => this.updateDoors(this.doorCommands.addDoor(this.state.wallEditor)),
      onSelectDoor: (id) => this.updateDoors(this.doorCommands.selectDoor(id)),
      onMoveDoor: (delta) => this.updateDoors(this.doorCommands.moveSelected(delta, this.state.wallEditor)),
      onEditDoor: (draft) => this.updateDoors(this.doorCommands.editSelected(draft, this.state.wallEditor)),
      onDeleteDoor: () => this.updateDoors(this.doorCommands.deleteSelected()),
      onUndoDoor: () => this.updateDoors(this.doorCommands.undo()),
      onRedoDoor: () => this.updateDoors(this.doorCommands.redo()),
      onSelectPart: (id) => this.selectPart(id),
      onTogglePartsNode: (id) => this.togglePartsNode(id),
      onSelectHierarchyPart: (id) => this.selectPart(id),
      onPreviousPart: () => this.movePartSelection(-1),
      onNextPart: () => this.movePartSelection(1),
      onExecute: () => this.executeFlow(),
    });
  }

  private updateWalls(wallEditor: AppState["wallEditor"], doorEditor = this.state.doorEditor): void {
    this.state = Object.freeze({
      ...this.state,
      wallEditor,
      doorEditor,
      execution: null,
      technicalDocumentation: this.state.project ? this.technicalDocumentationFactory.create(this.state.project.project) : this.state.technicalDocumentation,
      partsFoundation: this.state.project ? this.partsFoundationFactory.create(this.state.project.project) : this.state.partsFoundation,
      partsHierarchy: this.state.project ? this.partsHierarchyFactory.create(this.state.project.project, this.state.partsHierarchy?.expandedNodeIds ?? defaultExpanded(this.state.project.project), this.state.partsFoundation?.selectedPartId ?? null) : this.state.partsHierarchy,
      message: "Parede atualizada. Salve para regenerar o Projeto.mobi.",
    });
    this.render();
  }

  private updateDoors(doorEditor: AppState["doorEditor"]): void {
    this.state = Object.freeze({
      ...this.state,
      doorEditor,
      execution: null,
      technicalDocumentation: this.state.project ? this.technicalDocumentationFactory.create(this.state.project.project) : this.state.technicalDocumentation,
      partsFoundation: this.state.project ? this.partsFoundationFactory.create(this.state.project.project) : this.state.partsFoundation,
      partsHierarchy: this.state.project ? this.partsHierarchyFactory.create(this.state.project.project, this.state.partsHierarchy?.expandedNodeIds ?? defaultExpanded(this.state.project.project), this.state.partsFoundation?.selectedPartId ?? null) : this.state.partsHierarchy,
      message: "Porta atualizada. Salve para regenerar o Projeto.mobi.",
    });
    this.render();
  }

  private selectPart(partId: string | null): void {
    if (!this.state.project) return;
    this.state = Object.freeze({
      ...this.state,
      partsFoundation: this.partsFoundationFactory.create(this.state.project.project, partId),
      partsHierarchy: this.partsHierarchyFactory.create(this.state.project.project, this.state.partsHierarchy?.expandedNodeIds ?? defaultExpanded(this.state.project.project), partId),
    });
    this.render();
  }

  private togglePartsNode(nodeId: string): void {
    if (!this.state.project) return;
    this.state = Object.freeze({
      ...this.state,
      partsHierarchy: this.partsHierarchyFactory.create(
        this.state.project.project,
        toggleExpanded(this.state.partsHierarchy?.expandedNodeIds ?? defaultExpanded(this.state.project.project), nodeId),
        this.state.partsFoundation?.selectedPartId ?? null,
      ),
    });
    this.render();
  }

  private movePartSelection(direction: -1 | 1): void {
    const parts = this.state.partsFoundation?.parts ?? [];
    if (!this.state.project || parts.length === 0) return;
    const current = parts.findIndex((part) => part.id === this.state.partsFoundation?.selectedPartId);
    const next = Math.min(parts.length - 1, Math.max(0, (current === -1 ? 0 : current) + direction));
    this.selectPart(parts[next]?.id ?? null);
  }
}
