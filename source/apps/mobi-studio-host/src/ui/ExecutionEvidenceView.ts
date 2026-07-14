import type { AppState } from "../AppState";
import { escapeHtml } from "./ProjectOpenView";

export class ExecutionEvidenceView {
  render(state: AppState): string {
    const execution = state.execution;
    return `
      <section class="studio-panel">
        <h2>Evidencias</h2>
        ${execution && execution.evidence.length > 0
          ? `<ul class="list">${execution.evidence.map((item) => `<li><strong>${escapeHtml(item.code)}</strong>: ${escapeHtml(item.message)}</li>`).join("")}</ul>`
          : "<p>As evidencias aparecerao apos a execucao real.</p>"}
      </section>
    `;
  }
}

