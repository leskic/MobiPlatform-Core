import type { AppState } from "../AppState";
import { escapeHtml } from "./ProjectOpenView";

export class ExecutionDiagnosticsView {
  render(state: AppState): string {
    const execution = state.execution;
    return `
      <section class="studio-panel">
        <h2>Diagnosticos</h2>
        ${execution && execution.diagnostics.length > 0
          ? `<ul class="list">${execution.diagnostics.map((diagnostic) => `<li><strong>${escapeHtml(diagnostic.severity)}</strong> ${escapeHtml(diagnostic.code)}: ${escapeHtml(diagnostic.message)}</li>`).join("")}</ul>`
          : "<p>Nenhum diagnostico industrial registrado.</p>"}
        ${execution ? `<h2>Relatorio Final</h2><p>${escapeHtml(execution.finalReport)}</p>` : ""}
      </section>
    `;
  }
}

