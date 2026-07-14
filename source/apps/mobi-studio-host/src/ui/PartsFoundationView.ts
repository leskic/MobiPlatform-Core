import type { PartsFoundationViewModel } from "../PartsFoundationViewModel";
import { escapeHtml } from "./ProjectOpenView";

export class PartsFoundationView {
  render(parts: PartsFoundationViewModel | null): string {
    if (!parts) {
      return `
        <section class="studio-panel parts-foundation">
          <h2>Parts Foundation</h2>
          <p>Crie ou abra um Projeto.mobi para visualizar as pecas cadastradas.</p>
        </section>
      `;
    }

    return `
      <section class="studio-panel parts-foundation">
        <div class="panel-title-row">
          <h2>Parts Foundation</h2>
          <span>${parts.totalParts} pecas</span>
        </div>
        <p>${escapeHtml(parts.projectName)}</p>
        ${parts.parts.length > 0 ? `
          <div class="parts-table">
            <div class="parts-row parts-head"><span>ID</span><span>Modulo</span><span>Tipo</span><span>Dimensoes</span><span>Material</span></div>
            ${parts.parts.map((part) => `
              <div class="parts-row">
                <span>${escapeHtml(part.id)}</span>
                <span>${escapeHtml(part.moduleName)}<br /><small>${escapeHtml(part.moduleId)}</small></span>
                <span>${escapeHtml(part.category)} / ${escapeHtml(part.type)}</span>
                <span>${part.width} x ${part.height} x ${part.thickness} mm</span>
                <span>${escapeHtml(part.materialId)}</span>
              </div>
            `).join("")}
          </div>
        ` : "<p>Nenhuma peca registrada nos modulos do projeto.</p>"}
      </section>
    `;
  }
}

