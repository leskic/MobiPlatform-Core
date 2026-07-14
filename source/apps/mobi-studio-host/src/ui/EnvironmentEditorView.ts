import type { EnvironmentEditorState } from "../environments/EnvironmentModel";
import { escapeHtml } from "./ProjectOpenView";

export class EnvironmentEditorView {
  render(editor: EnvironmentEditorState): string {
    const selected = editor.environments.find((environment) => environment.id === editor.selectedEnvironmentId) ?? null;
    return `
      <section class="studio-panel environment-editor">
        <div class="panel-title-row">
          <h2>Environment Editor</h2>
          <span>${editor.environments.length} ambientes</span>
        </div>
        <div class="environment-toolbar">
          <button class="secondary-button" data-add-environment>Adicionar Ambiente</button>
          <button class="secondary-button" data-delete-environment ${selected ? "" : "disabled"}>Excluir Ambiente</button>
        </div>
        ${editor.environments.length > 0 ? `
          <div class="environment-list">
            ${editor.environments.map((environment) => `
              <button class="environment-row ${environment.id === editor.selectedEnvironmentId ? "selected" : ""}" data-environment-id="${escapeHtml(environment.id)}">
                <span>${escapeHtml(environment.name)}</span>
                <small class="mono">${escapeHtml(environment.id)}</small>
              </button>
            `).join("")}
          </div>
        ` : "<p>Nenhum ambiente criado.</p>"}
        <form class="environment-inspector" data-environment-form>
          <label>Ambiente ativo
            <input name="environmentName" value="${escapeHtml(selected?.name ?? "")}" ${selected ? "" : "disabled"} />
          </label>
          <button class="primary-button" type="submit" ${selected ? "" : "disabled"}>Renomear Ambiente</button>
        </form>
      </section>
    `;
  }
}
