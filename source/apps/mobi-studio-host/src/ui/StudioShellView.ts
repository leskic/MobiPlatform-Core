import type { AppState } from "../AppState";
import type { DoorDraft } from "../doors/DoorModel";
import { DoorRenderer } from "../doors/DoorRenderer";
import { DoorSelection } from "../doors/DoorSelection";
import type { EnvironmentDraft } from "../environments/EnvironmentModel";
import type { NewProjectDraft } from "../NewProjectDraft";
import type { WallDraft } from "../walls/WallModel";
import { WallRenderer } from "../walls/WallRenderer";
import { WallSelection } from "../walls/WallSelection";
import { ExecutionDiagnosticsView } from "./ExecutionDiagnosticsView";
import { ExecutionEvidenceView } from "./ExecutionEvidenceView";
import { ExecutionStatusView } from "./ExecutionStatusView";
import { escapeHtml, ProjectOpenView } from "./ProjectOpenView";
import { ViewerPanel } from "./ViewerPanel";
import { DoorInspector } from "./DoorInspector";
import { EnvironmentEditorView } from "./EnvironmentEditorView";
import { PartsFoundationView } from "./PartsFoundationView";
import { PartsHierarchyView } from "./PartsHierarchyView";
import { TechnicalDocumentationView } from "./TechnicalDocumentationView";
import { WallInspector } from "./WallInspector";

export interface StudioShellHandlers {
  readonly onProjectSelected: (file: File) => void;
  readonly onNewProject: () => void;
  readonly onCreateProject: (draft: Partial<NewProjectDraft>) => void;
  readonly onAddWall: () => void;
  readonly onSelectWall: (id: string | null) => void;
  readonly onMoveWall: (dx: number, dy: number) => void;
  readonly onEditWall: (draft: WallDraft) => void;
  readonly onDeleteWall: () => void;
  readonly onUndoWall: () => void;
  readonly onRedoWall: () => void;
  readonly onAddDoor: () => void;
  readonly onSelectDoor: (id: string | null) => void;
  readonly onMoveDoor: (delta: number) => void;
  readonly onEditDoor: (draft: DoorDraft) => void;
  readonly onDeleteDoor: () => void;
  readonly onUndoDoor: () => void;
  readonly onRedoDoor: () => void;
  readonly onAddEnvironment: () => void;
  readonly onSelectEnvironment: (id: string | null) => void;
  readonly onRenameEnvironment: (draft: EnvironmentDraft) => void;
  readonly onDeleteEnvironment: () => void;
  readonly onSelectPart: (id: string | null) => void;
  readonly onTogglePartsNode: (id: string) => void;
  readonly onSelectHierarchyPart: (id: string | null) => void;
  readonly onPreviousPart: () => void;
  readonly onNextPart: () => void;
  readonly onExecute: () => void;
}

export class StudioShellView {
  constructor(
    private readonly projectOpen = new ProjectOpenView(),
    private readonly status = new ExecutionStatusView(),
    private readonly evidence = new ExecutionEvidenceView(),
    private readonly diagnostics = new ExecutionDiagnosticsView(),
    private readonly viewer = new ViewerPanel(),
    private readonly wallRenderer = new WallRenderer(),
    private readonly wallSelection = new WallSelection(),
    private readonly wallInspector = new WallInspector(),
    private readonly doorRenderer = new DoorRenderer(),
    private readonly doorSelection = new DoorSelection(),
    private readonly doorInspector = new DoorInspector(),
    private readonly environmentEditor = new EnvironmentEditorView(),
    private readonly technicalDocumentation = new TechnicalDocumentationView(),
    private readonly partsHierarchy = new PartsHierarchyView(),
    private readonly partsFoundation = new PartsFoundationView(),
  ) {}

  mount(root: HTMLElement, state: AppState, handlers: StudioShellHandlers): void {
    root.innerHTML = this.render(state);
    root.querySelector<HTMLInputElement>("[data-project-input]")?.addEventListener("change", (event) => {
      const input = event.currentTarget as HTMLInputElement | null;
      if (!input) return;
      const file = input.files?.[0];
      if (file) handlers.onProjectSelected(file);
    });
    root.querySelector<HTMLButtonElement>("[data-new-project]")?.addEventListener("click", handlers.onNewProject);
    root.querySelector<HTMLFormElement>("[data-new-project-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget as HTMLFormElement;
      const data = new FormData(form);
      handlers.onCreateProject({
        projectName: String(data.get("projectName") ?? ""),
        clientName: String(data.get("clientName") ?? ""),
        environmentName: String(data.get("environmentName") ?? ""),
        projectCode: String(data.get("projectCode") ?? ""),
      });
    });
    root.querySelector<HTMLButtonElement>("[data-add-wall]")?.addEventListener("click", handlers.onAddWall);
    root.querySelector<HTMLButtonElement>("[data-wall-left]")?.addEventListener("click", () => handlers.onMoveWall(-50, 0));
    root.querySelector<HTMLButtonElement>("[data-wall-right]")?.addEventListener("click", () => handlers.onMoveWall(50, 0));
    root.querySelector<HTMLButtonElement>("[data-wall-up]")?.addEventListener("click", () => handlers.onMoveWall(0, -50));
    root.querySelector<HTMLButtonElement>("[data-wall-down]")?.addEventListener("click", () => handlers.onMoveWall(0, 50));
    root.querySelector<HTMLButtonElement>("[data-delete-wall]")?.addEventListener("click", handlers.onDeleteWall);
    root.querySelector<HTMLButtonElement>("[data-undo-wall]")?.addEventListener("click", handlers.onUndoWall);
    root.querySelector<HTMLButtonElement>("[data-redo-wall]")?.addEventListener("click", handlers.onRedoWall);
    root.querySelectorAll<SVGElement>("[data-wall-id]").forEach((wall) => {
      wall.addEventListener("click", () => handlers.onSelectWall(wall.dataset.wallId ?? null));
    });
    root.querySelectorAll<SVGElement>("[data-door-id]").forEach((door) => {
      door.addEventListener("click", () => handlers.onSelectDoor(door.dataset.doorId ?? null));
    });
    root.querySelector<HTMLFormElement>("[data-wall-inspector-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget as HTMLFormElement);
      handlers.onEditWall({
        x: Number(data.get("wallX")),
        y: Number(data.get("wallY")),
        length: Number(data.get("wallLength")),
        thickness: Number(data.get("wallThickness")),
        height: Number(data.get("wallHeight")),
        rotation: Number(data.get("wallRotation")),
      });
    });
    root.querySelector<HTMLButtonElement>("[data-add-door]")?.addEventListener("click", handlers.onAddDoor);
    root.querySelector<HTMLButtonElement>("[data-door-back]")?.addEventListener("click", () => handlers.onMoveDoor(-50));
    root.querySelector<HTMLButtonElement>("[data-door-forward]")?.addEventListener("click", () => handlers.onMoveDoor(50));
    root.querySelector<HTMLButtonElement>("[data-delete-door]")?.addEventListener("click", handlers.onDeleteDoor);
    root.querySelector<HTMLButtonElement>("[data-undo-door]")?.addEventListener("click", handlers.onUndoDoor);
    root.querySelector<HTMLButtonElement>("[data-redo-door]")?.addEventListener("click", handlers.onRedoDoor);
    root.querySelector<HTMLFormElement>("[data-door-inspector-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget as HTMLFormElement);
      handlers.onEditDoor({
        offset: Number(data.get("doorOffset")),
        width: Number(data.get("doorWidth")),
        height: Number(data.get("doorHeight")),
      });
    });
    root.querySelector<HTMLButtonElement>("[data-add-environment]")?.addEventListener("click", handlers.onAddEnvironment);
    root.querySelector<HTMLButtonElement>("[data-delete-environment]")?.addEventListener("click", handlers.onDeleteEnvironment);
    root.querySelectorAll<HTMLButtonElement>("[data-environment-id]").forEach((environment) => {
      environment.addEventListener("click", () => handlers.onSelectEnvironment(environment.dataset.environmentId ?? null));
    });
    root.querySelector<HTMLFormElement>("[data-environment-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget as HTMLFormElement);
      handlers.onRenameEnvironment({ name: String(data.get("environmentName") ?? "") });
    });
    root.querySelectorAll<HTMLElement>("[data-part-id]").forEach((part) => {
      part.addEventListener("click", () => handlers.onSelectPart(part.dataset.partId ?? null));
    });
    root.querySelectorAll<HTMLButtonElement>("[data-tree-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const nodeId = toggle.dataset.treeToggle;
        if (nodeId) handlers.onTogglePartsNode(nodeId);
      });
    });
    root.querySelectorAll<HTMLButtonElement>("[data-tree-part-id]").forEach((part) => {
      part.addEventListener("click", () => handlers.onSelectHierarchyPart(part.dataset.treePartId ?? null));
    });
    root.querySelector<HTMLButtonElement>("[data-previous-part]")?.addEventListener("click", handlers.onPreviousPart);
    root.querySelector<HTMLButtonElement>("[data-next-part]")?.addEventListener("click", handlers.onNextPart);
    root.querySelector<HTMLButtonElement>("[data-execute-flow]")?.addEventListener("click", handlers.onExecute);
  }

  render(state: AppState): string {
    return `
      <div class="studio-shell">
        <header class="studio-header">
          <h1>Mobi Studio</h1>
          <div class="studio-actions">
            <button class="secondary-button" data-new-project>Novo Projeto</button>
            <label class="primary-button">
              Abrir Projeto.mobi
              <input data-project-input type="file" accept=".mobi,.json,application/json" hidden />
            </label>
            <button class="secondary-button" data-execute-flow ${state.project && state.status !== "running" ? "" : "disabled"}>Executar Fluxo</button>
          </div>
        </header>
        <main class="studio-main">
          <aside class="stack">
            ${this.projectOpen.render(state)}
            ${this.renderNewProjectForm(state)}
            ${this.status.render(state)}
          </aside>
          <section class="stack">
            ${this.environmentEditor.render(state.environmentEditor)}
            ${this.renderWallEditor(state)}
            ${this.technicalDocumentation.render(state.technicalDocumentation)}
            ${this.partsHierarchy.render(state.partsHierarchy)}
            ${this.partsFoundation.render(state.partsFoundation)}
            ${this.viewer.render(state)}
            ${this.evidence.render(state)}
            ${this.diagnostics.render(state)}
          </section>
        </main>
      </div>
    `;
  }

  private renderNewProjectForm(state: AppState): string {
    if (state.status !== "creating-project") return "";
    return `
      <section class="studio-panel">
        <h2>Novo Projeto</h2>
        <form class="new-project-form" data-new-project-form>
          <label>Nome do projeto<input name="projectName" value="${escapeHtml(state.draft.projectName)}" /></label>
          <label>Cliente<input name="clientName" value="${escapeHtml(state.draft.clientName)}" /></label>
          <label>Ambiente<input name="environmentName" value="${escapeHtml(state.draft.environmentName)}" /></label>
          <label>Codigo<input name="projectCode" value="${escapeHtml(state.draft.projectCode)}" /></label>
          <p>Preset: Cozinha simples com paredes editaveis, infraestrutura, modulos, pecas e ferragens.</p>
          <button class="primary-button" type="submit">Gerar Projeto.mobi</button>
        </form>
      </section>
    `;
  }

  private renderWallEditor(state: AppState): string {
    if (state.status !== "creating-project" && state.status !== "project-loaded") return "";
    const selected = this.wallSelection.selected(state.wallEditor);
    return `
      <section class="studio-panel wall-editor">
        <div class="panel-title-row">
          <h2>Wall Editor</h2>
          <span>${state.wallEditor.walls.length} paredes</span>
        </div>
        ${this.wallRenderer.render(state.wallEditor)}
        <svg class="door-overlay" viewBox="-20 -20 420 300" aria-hidden="true">${this.doorRenderer.render(state.doorEditor, state.wallEditor)}</svg>
        <div class="wall-toolbar">
          <button class="secondary-button" data-add-wall>Adicionar Parede</button>
          <button class="secondary-button" data-undo-wall>Desfazer</button>
          <button class="secondary-button" data-redo-wall>Refazer</button>
          <button class="secondary-button" data-delete-wall ${selected ? "" : "disabled"}>Excluir</button>
        </div>
        <div class="wall-move-controls">
          <button class="secondary-button" data-wall-up>Cima</button>
          <button class="secondary-button" data-wall-left>Esquerda</button>
          <button class="secondary-button" data-wall-right>Direita</button>
          <button class="secondary-button" data-wall-down>Baixo</button>
        </div>
        <form data-wall-inspector-form>
          ${this.wallInspector.render(selected)}
        </form>
        ${this.renderDoorEditor(state)}
      </section>
    `;
  }

  private renderDoorEditor(state: AppState): string {
    const selected = this.doorSelection.selected(state.doorEditor);
    return `
      <div class="door-editor">
        <div class="panel-title-row">
          <h2>Door Editor</h2>
          <span>${state.doorEditor.doors.length} portas</span>
        </div>
        <div class="wall-toolbar">
          <button class="secondary-button" data-add-door>Inserir Porta</button>
          <button class="secondary-button" data-undo-door>Desfazer Porta</button>
          <button class="secondary-button" data-redo-door>Refazer Porta</button>
          <button class="secondary-button" data-delete-door ${selected ? "" : "disabled"}>Excluir Porta</button>
        </div>
        <div class="wall-move-controls">
          <button class="secondary-button" data-door-back>Voltar na parede</button>
          <button class="secondary-button" data-door-forward>Avancar na parede</button>
        </div>
        <form data-door-inspector-form>
          ${this.doorInspector.render(selected)}
        </form>
      </div>
    `;
  }
}
