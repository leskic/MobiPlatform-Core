import type { AppState } from "../AppState";
import { ExecutionDiagnosticsView } from "./ExecutionDiagnosticsView";
import { ExecutionEvidenceView } from "./ExecutionEvidenceView";
import { ExecutionStatusView } from "./ExecutionStatusView";
import { ProjectOpenView } from "./ProjectOpenView";
import { ViewerPanel } from "./ViewerPanel";

export interface StudioShellHandlers {
  readonly onProjectSelected: (file: File) => void;
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
    root.querySelector<HTMLButtonElement>("[data-execute-flow]")?.addEventListener("click", handlers.onExecute);
  }

  render(state: AppState): string {
    return `
      <div class="studio-shell">
        <header class="studio-header">
          <h1>Mobi Studio</h1>
          <div class="studio-actions">
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
}
