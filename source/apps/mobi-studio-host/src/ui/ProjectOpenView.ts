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
          <a class="secondary-link" download="${escapeHtml(project.fileName)}" href="${projectDownloadHref(project.source)}">Baixar Projeto.mobi</a>
        ` : "<p>Nenhum Projeto.mobi carregado.</p>"}
      </section>
    `;
  }
}

function projectDownloadHref(source: string): string {
  return `data:application/json;charset=utf-8,${encodeURIComponent(source)}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
