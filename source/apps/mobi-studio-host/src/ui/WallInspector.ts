import type { Wall } from "../walls/WallModel";
import { escapeHtml } from "./ProjectOpenView";

export class WallInspector {
  render(wall: Wall | null): string {
    if (!wall) return "<p>Selecione uma parede para editar.</p>";
    return `
      <div class="wall-inspector">
        <p><strong>${escapeHtml(wall.id)}</strong></p>
        <label>X<input name="wallX" type="number" value="${wall.x}" /></label>
        <label>Y<input name="wallY" type="number" value="${wall.y}" /></label>
        <label>Comprimento<input name="wallLength" type="number" value="${wall.length}" /></label>
        <label>Espessura<input name="wallThickness" type="number" value="${wall.thickness}" /></label>
        <label>Altura<input name="wallHeight" type="number" value="${wall.height}" /></label>
        <label>Rotacao<input name="wallRotation" type="number" value="${wall.rotation}" /></label>
        <button class="secondary-button" type="submit">Aplicar parede</button>
      </div>
    `;
  }
}

