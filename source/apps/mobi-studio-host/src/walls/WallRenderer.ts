import type { WallEditorState } from "./WallModel";

export class WallRenderer {
  render(state: WallEditorState): string {
    const walls = state.walls.map((wall) => {
      const selected = wall.id === state.selectedWallId ? " selected" : "";
      const x2 = wall.x + Math.cos(toRadians(wall.rotation)) * wall.length;
      const y2 = wall.y + Math.sin(toRadians(wall.rotation)) * wall.length;
      return `<line data-wall-id="${wall.id}" class="wall-line${selected}" x1="${wall.x / 10}" y1="${wall.y / 10}" x2="${x2 / 10}" y2="${y2 / 10}" stroke-width="${Math.max(4, wall.thickness / 25)}" />`;
    }).join("");

    return `
      <svg class="wall-canvas" viewBox="-20 -20 420 300" role="img" aria-label="Editor de paredes">
        <g class="grid">${this.grid()}</g>
        <g>${walls}</g>
      </svg>
    `;
  }

  private grid(): string {
    return Array.from({ length: 9 }, (_, index) => index * 50 / 10)
      .map((position) => `<line x1="${position}" y1="0" x2="${position}" y2="260" /><line x1="0" y1="${position}" x2="380" y2="${position}" />`)
      .join("");
  }
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

