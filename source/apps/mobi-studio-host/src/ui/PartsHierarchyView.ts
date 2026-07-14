import type { PartsHierarchyViewModel } from "../PartsHierarchyViewModel";
import { escapeHtml } from "./ProjectOpenView";

export class PartsHierarchyView {
  render(hierarchy: PartsHierarchyViewModel | null): string {
    if (!hierarchy) {
      return `
        <section class="studio-panel parts-hierarchy">
          <h2>Parts Hierarchy</h2>
          <p>Crie ou abra um Projeto.mobi para visualizar a arvore de pecas.</p>
        </section>
      `;
    }

    return `
      <section class="studio-panel parts-hierarchy">
        <h2>Parts Hierarchy</h2>
        <div class="tree-node project-node">
          ${this.toggle(hierarchy.projectId, hierarchy.expandedNodeIds)}
          <strong>${escapeHtml(hierarchy.projectName)}</strong>
        </div>
        ${hierarchy.expandedNodeIds.includes(hierarchy.projectId) ? hierarchy.environments.map((environment) => `
          <div class="tree-children">
            <div class="tree-node">
              ${this.toggle(environment.id, hierarchy.expandedNodeIds)}
              <span>${escapeHtml(environment.name)}</span>
            </div>
            ${hierarchy.expandedNodeIds.includes(environment.id) ? environment.modules.map((module) => `
              <div class="tree-children">
                <div class="tree-node">
                  ${this.toggle(module.id, hierarchy.expandedNodeIds)}
                  <span>${escapeHtml(module.name)}</span>
                  <span class="tree-count">${module.partCount} parts</span>
                </div>
                ${hierarchy.expandedNodeIds.includes(module.id) ? module.parts.map((part) => `
                  <button class="tree-node tree-part ${part.id === hierarchy.selectedPartId ? "selected" : ""}" data-tree-part-id="${escapeHtml(part.id)}">
                    <span>${escapeHtml(part.name)}</span>
                    <small class="mono">${escapeHtml(part.id)}</small>
                  </button>
                `).join("") : ""}
              </div>
            `).join("") : ""}
          </div>
        `).join("") : ""}
      </section>
    `;
  }

  private toggle(nodeId: string, expandedNodeIds: readonly string[]): string {
    const expanded = expandedNodeIds.includes(nodeId);
    return `<button class="tree-toggle" data-tree-toggle="${escapeHtml(nodeId)}" aria-label="${expanded ? "Recolher" : "Expandir"}">${expanded ? "-" : "+"}</button>`;
  }
}

