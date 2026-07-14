import type { AppState } from "../AppState";
import { escapeHtml } from "./ProjectOpenView";

export class ViewerPanel {
  render(state: AppState): string {
    const viewer = state.execution?.viewer;
    return `
      <section class="studio-panel viewer-panel">
        <h2>MobiView</h2>
        ${viewer ? `
          <p><strong>${escapeHtml(viewer.status)}</strong></p>
          <p>${escapeHtml(viewer.summary)}</p>
          ${viewer.projectId ? `<p class="mono">${escapeHtml(viewer.projectId)}</p>` : ""}
        ` : "<p>Aguardando snapshot industrial aprovado.</p>"}
      </section>
    `;
  }
}

