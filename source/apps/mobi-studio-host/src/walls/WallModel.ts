export interface Wall {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly length: number;
  readonly thickness: number;
  readonly height: number;
  readonly rotation: number;
}

export interface WallEditorState {
  readonly walls: readonly Wall[];
  readonly selectedWallId: string | null;
}

export interface WallDraft {
  readonly x?: number;
  readonly y?: number;
  readonly length?: number;
  readonly thickness?: number;
  readonly height?: number;
  readonly rotation?: number;
}

export function defaultWall(id: string, draft: WallDraft = {}): Wall {
  return Object.freeze({
    id,
    x: draft.x ?? 0,
    y: draft.y ?? 0,
    length: draft.length ?? 3000,
    thickness: draft.thickness ?? 150,
    height: draft.height ?? 2700,
    rotation: draft.rotation ?? 0,
  });
}

export function emptyWallEditorState(): WallEditorState {
  return Object.freeze({
    walls: [],
    selectedWallId: null,
  });
}

export function defaultFourWallState(): WallEditorState {
  return Object.freeze({
    walls: [
      defaultWall("wall-1", { x: 0, y: 0, length: 3000, rotation: 0 }),
      defaultWall("wall-2", { x: 0, y: 2200, length: 3000, rotation: 180 }),
      defaultWall("wall-3", { x: 0, y: 0, length: 2200, rotation: 90 }),
      defaultWall("wall-4", { x: 3000, y: 0, length: 2200, rotation: -90 }),
    ],
    selectedWallId: "wall-1",
  });
}
