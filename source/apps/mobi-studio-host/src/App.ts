import { ExecutionController, type ExecutionControllerResult } from "./ExecutionController";
import { initialAppState, type AppState } from "./AppState";
import { normalizeDraft, type NewProjectDraft } from "./NewProjectDraft";
import { ProjectFileLoader } from "./ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "./SimpleKitchenProjectFactory";
import { StudioShellView } from "./ui/StudioShellView";

export class App {
  private state: AppState = initialAppState();

  constructor(
    private readonly root: HTMLElement,
    private readonly loader = new ProjectFileLoader(),
    private readonly controller = new ExecutionController(),
    private readonly projectFactory = new SimpleKitchenProjectFactory(),
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
        execution: null,
        message: `${loaded.code}: ${loaded.message}`,
      });
      this.render();
      return;
    }

    this.state = Object.freeze({
      status: "project-loaded",
      project: loaded.project,
      draft: this.state.draft,
      execution: null,
      message: "Projeto.mobi carregado e validado.",
    });
    this.render();
  }

  startNewProject(): void {
    this.state = Object.freeze({
      ...this.state,
      status: "creating-project",
      execution: null,
      message: "Preencha os dados e gere uma Cozinha simples.",
    });
    this.render();
  }

  createProject(draftInput: Partial<NewProjectDraft>): void {
    const draft = normalizeDraft(draftInput);
    const source = this.projectFactory.createJson(draft);
    const loaded = this.loader.loadText(source, `${draft.projectCode}.mobi`);
    if (!loaded.success) {
      this.state = Object.freeze({
        status: "error",
        project: null,
        draft,
        execution: null,
        message: `${loaded.code}: ${loaded.message}`,
      });
      this.render();
      return;
    }

    this.state = Object.freeze({
      status: "project-loaded",
      project: loaded.project,
      draft,
      execution: null,
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
      execution: result.viewModel,
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
      onExecute: () => this.executeFlow(),
    });
  }
}
