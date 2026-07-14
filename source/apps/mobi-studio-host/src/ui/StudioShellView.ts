import type { AppState } from "../AppState";
import type { NewProjectDraft } from "../NewProjectDraft";
import { ExecutionDiagnosticsView } from "./ExecutionDiagnosticsView";
import { ExecutionEvidenceView } from "./ExecutionEvidenceView";
import { ExecutionStatusView } from "./ExecutionStatusView";
import { escapeHtml, ProjectOpenView } from "./ProjectOpenView";
import { ViewerPanel } from "./ViewerPanel";

export interface StudioShellHandlers {
  readonly onProjectSelected: (file: File) => void;
  readonly onNewProject: () => void;
  readonly onCreateProject: (draft: Partial<NewProjectDraft>) => void;
  readonly onExecute: () => void;
}

export class StudioShellView {
  constructor(
    private readonly projectOpen = new ProjectOpenView(),
    private readonly status = new ExecutionStatusView(),
    private readonly evidence = new ExecutionEvidenceView(),
    private readonly diagnostics = new ExecutionDiagnosticsView(),
    private readonly viewer = new ViewerPanel(),
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
          <p>Preset: Cozinha simples com paredes, infraestrutura, modulos, pecas e ferragens.</p>
          <button class="primary-button" type="submit">Gerar Projeto.mobi</button>
        </form>
      </section>
    `;
  }
}
