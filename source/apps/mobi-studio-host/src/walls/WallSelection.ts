import type { WallEditorState } from "./WallModel";

export class WallSelection {
  selected(state: WallEditorState) {
    return state.walls.find((wall) => wall.id === state.selectedWallId) ?? null;
  }
}

