import { defaultWall, type Wall, type WallDraft, type WallEditorState } from "./WallModel";

export class WallCommands {
  private history: WallEditorState[];
  private cursor = 0;
  private nextId = 1;

  constructor(initial: WallEditorState) {
    this.history = [initial];
  }

  current(): WallEditorState {
    return this.history[this.cursor]!;
  }

  addWall(draft: WallDraft = {}): WallEditorState {
    const wall = defaultWall(this.allocateId(), this.snapDraft(draft));
    return this.commit({
      walls: [...this.current().walls, wall],
      selectedWallId: wall.id,
    });
  }

  selectWall(id: string | null): WallEditorState {
    if (id !== null && !this.current().walls.some((wall) => wall.id === id)) return this.current();
    return this.commit({ ...this.current(), selectedWallId: id });
  }

  moveSelected(dx: number, dy: number): WallEditorState {
    const selected = this.current().selectedWallId;
    if (!selected) return this.current();
    return this.updateWall(selected, (wall) => ({ ...wall, x: snap(wall.x + dx), y: snap(wall.y + dy) }));
  }

  editSelected(draft: WallDraft): WallEditorState {
    const selected = this.current().selectedWallId;
    if (!selected) return this.current();
    return this.updateWall(selected, (wall) => ({ ...wall, ...this.snapDraft(draft) }));
  }

  deleteSelected(): WallEditorState {
    const selected = this.current().selectedWallId;
    if (!selected) return this.current();
    return this.commit({
      walls: this.current().walls.filter((wall) => wall.id !== selected),
      selectedWallId: null,
    });
  }

  undo(): WallEditorState {
    this.cursor = Math.max(0, this.cursor - 1);
    return this.current();
  }

  redo(): WallEditorState {
    this.cursor = Math.min(this.history.length - 1, this.cursor + 1);
    return this.current();
  }

  private updateWall(id: string, update: (wall: Wall) => Wall): WallEditorState {
    return this.commit({
      walls: this.current().walls.map((wall) => wall.id === id ? Object.freeze(update(wall)) : wall),
      selectedWallId: id,
    });
  }

  private commit(next: WallEditorState): WallEditorState {
    const frozen = Object.freeze({
      walls: next.walls.map((wall) => Object.freeze({ ...wall })),
      selectedWallId: next.selectedWallId,
    });
    this.history = [...this.history.slice(0, this.cursor + 1), frozen];
    this.cursor = this.history.length - 1;
    return frozen;
  }

  private allocateId(): string {
    return `wall-${this.nextId++}`;
  }

  private snapDraft(draft: WallDraft): WallDraft {
    const next: Record<string, number> = {};
    if (draft.x !== undefined) next.x = snap(draft.x);
    if (draft.y !== undefined) next.y = snap(draft.y);
    if (draft.length !== undefined) next.length = snap(draft.length);
    if (draft.thickness !== undefined) next.thickness = snap(draft.thickness);
    if (draft.height !== undefined) next.height = snap(draft.height);
    if (draft.rotation !== undefined) next.rotation = draft.rotation;
    return next;
  }
}

export function snap(value: number, grid = 50): number {
  return Math.round(value / grid) * grid;
}
