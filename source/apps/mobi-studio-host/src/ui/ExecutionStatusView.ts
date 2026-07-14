import type { AppState } from "../AppState";
import { escapeHtml } from "./ProjectOpenView";

export class ExecutionStatusView {
  render(state: AppState): string {
    const execution = state.execution;
    return `
      <section class="studio-panel stack">
        <h2>Status da Execucao</h2>
        <span class="status-pill ${state.status}">${escapeHtml(state.status)}</span>
        ${state.message ? `<p>${escapeHtml(state.message)}</p>` : ""}
        ${execution ? `
          <div class="metric-grid">
            <div class="metric"><span>Duracao total</span><strong>${execution.totalDurationMs} ms</strong></div>
            <div class="metric"><span>Sucesso</span><strong>${execution.successPercent}%</strong></div>
            <div class="metric"><span>Warnings</span><strong>${execution.warnings}</strong></div>
            <div class="metric"><span>Erros</span><strong>${execution.errors}</strong></div>
          </div>
          <h2>Etapas</h2>
          <ul class="list">${Object.entries(execution.durationsByStep).map(([step, ms]) => `<li>${escapeHtml(step)}: ${ms} ms</li>`).join("")}</ul>
          <h2>Produtos Executados</h2>
          <ul class="list">${execution.productsExecuted.map((product) => `<li>${escapeHtml(product)}</li>`).join("")}</ul>
        ` : ""}
      </section>
    `;
  }
}

