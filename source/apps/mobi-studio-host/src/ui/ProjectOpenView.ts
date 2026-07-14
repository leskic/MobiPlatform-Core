import type { AppState } from "../AppState";

export class ProjectOpenView {
  render(state: AppState): string {
    const project = state.project;
    return `
      <section class="studio-panel">
        <h2>Projeto</h2>
        ${project ? `
          <p><strong>${escapeHtml(project.projectName)}</strong></p>
          <p class="mono">${escapeHtml(project.projectId)}</p>
          <p>${escapeHtml(project.fileName)}</p>
        ` : "<p>Nenhum Projeto.mobi carregado.</p>"}
      </section>
    `;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

