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
          <div class="parts-inspector">
            <div class="panel-title-row">
              <h3>Parts Inspector</h3>
              <div class="parts-navigation">
                <button class="secondary-button" data-previous-part>Anterior</button>
                <button class="secondary-button" data-next-part>Proxima</button>
              </div>
            </div>
            ${parts.selectedPart ? `
              <dl class="parts-detail">
                <div><dt>ID</dt><dd class="mono">${escapeHtml(parts.selectedPart.id)}</dd></div>
                <div><dt>Modulo</dt><dd>${escapeHtml(parts.selectedPart.moduleName)}</dd></div>
                <div><dt>Modulo ID</dt><dd class="mono">${escapeHtml(parts.selectedPart.moduleId)}</dd></div>
                <div><dt>Tipo</dt><dd>${escapeHtml(parts.selectedPart.category)} / ${escapeHtml(parts.selectedPart.type)}</dd></div>
                <div><dt>Dimensoes</dt><dd>${parts.selectedPart.width} x ${parts.selectedPart.height} x ${parts.selectedPart.thickness} mm</dd></div>
                <div><dt>Material</dt><dd>${escapeHtml(parts.selectedPart.materialId)}</dd></div>
              </dl>
            ` : "<p>Nenhuma peca selecionada.</p>"}
          </div>
          <div class="parts-table">
            <div class="parts-row parts-head"><span>ID</span><span>Modulo</span><span>Tipo</span><span>Dimensoes</span><span>Material</span></div>
            ${parts.parts.map((part) => `
              <button class="parts-row parts-row-button ${part.id === parts.selectedPartId ? "selected" : ""}" data-part-id="${escapeHtml(part.id)}">
                <span>${escapeHtml(part.id)}</span>
                <span>${escapeHtml(part.moduleName)}<br /><small>${escapeHtml(part.moduleId)}</small></span>
                <span>${escapeHtml(part.category)} / ${escapeHtml(part.type)}</span>
                <span>${part.width} x ${part.height} x ${part.thickness} mm</span>
                <span>${escapeHtml(part.materialId)}</span>
              </button>
            `).join("")}
          </div>
        ` : "<p>Nenhuma peca registrada nos modulos do projeto.</p>"}
      </section>
    `;
  }
}
