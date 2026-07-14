import type { Door } from "../doors/DoorModel";
import { escapeHtml } from "./ProjectOpenView";

export class DoorInspector {
  render(door: Door | null): string {
    if (!door) return "<p>Selecione uma porta para editar.</p>";
    return `
      <div class="door-inspector">
        <p><strong>${escapeHtml(door.id)}</strong> na parede ${escapeHtml(door.wallId)}</p>
        <label>Posicao na parede<input name="doorOffset" type="number" value="${door.offset}" /></label>
        <label>Largura<input name="doorWidth" type="number" value="${door.width}" /></label>
        <label>Altura<input name="doorHeight" type="number" value="${door.height}" /></label>
        <button class="secondary-button" type="submit">Aplicar porta</button>
      </div>
    `;
  }
}
