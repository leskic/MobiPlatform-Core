import type { TechnicalDocumentationViewModel } from "../TechnicalDocumentationViewModel";
import { escapeHtml } from "./ProjectOpenView";

export class TechnicalDocumentationView {
  render(documentation: TechnicalDocumentationViewModel | null): string {
    if (!documentation) {
      return `
        <section class="studio-panel technical-documentation">
          <h2>Caderno Tecnico</h2>
          <p>Crie ou abra um Projeto.mobi para visualizar a documentacao tecnica.</p>
        </section>
      `;
    }

    return `
      <section class="studio-panel technical-documentation">
        <div class="panel-title-row">
          <h2>Caderno Tecnico</h2>
          <span>Estrutura para exportacao futura</span>
        </div>
        <div class="technical-summary">
          <div><span>Projeto</span><strong>${escapeHtml(documentation.projectName)}</strong></div>
          <div><span>Codigo</span><strong>${escapeHtml(documentation.projectCode)}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(documentation.status)}</strong></div>
          <div><span>ID</span><strong class="mono">${escapeHtml(documentation.projectId)}</strong></div>
        </div>
        ${documentation.environments.map((environment) => `
          <article class="technical-section">
            <h3>${escapeHtml(environment.name)}</h3>
            <p class="mono">${escapeHtml(environment.id)}</p>
            <h4>Paredes</h4>
            ${environment.walls.length > 0 ? `
              <div class="technical-table">
                <div class="technical-row technical-head"><span>ID</span><span>Compr.</span><span>Alt.</span><span>Esp.</span><span>Posicao</span></div>
                ${environment.walls.map((wall) => `
                  <div class="technical-row"><span>${escapeHtml(wall.id)}</span><span>${wall.length} mm</span><span>${wall.height} mm</span><span>${wall.thickness} mm</span><span>${wall.x}, ${wall.y} / ${wall.rotation} deg</span></div>
                `).join("")}
              </div>
            ` : "<p>Nenhuma parede registrada.</p>"}
            <h4>Portas</h4>
            ${environment.doors.length > 0 ? `
              <div class="technical-table">
                <div class="technical-row technical-head"><span>ID</span><span>Parede</span><span>Larg.</span><span>Alt.</span><span>Posicao</span></div>
                ${environment.doors.map((door) => `
                  <div class="technical-row"><span>${escapeHtml(door.id)}</span><span>${escapeHtml(door.hostWallId)}</span><span>${door.width} mm</span><span>${door.height} mm</span><span>${door.x}, ${door.y}</span></div>
                `).join("")}
              </div>
            ` : "<p>Nenhuma porta registrada.</p>"}
          </article>
        `).join("")}
        <div class="technical-future">
          <h3>Estrutura futura</h3>
          <ul class="list">${documentation.futureSections.map((section) => `<li>${escapeHtml(section)}</li>`).join("")}</ul>
        </div>
      </section>
    `;
  }
}

