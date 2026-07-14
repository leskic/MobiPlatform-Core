export interface Door {
  readonly id: string;
  readonly wallId: string;
  readonly offset: number;
  readonly width: number;
  readonly height: number;
}

export interface DoorEditorState {
  readonly doors: readonly Door[];
  readonly selectedDoorId: string | null;
}

export interface DoorDraft {
  readonly wallId?: string;
  readonly offset?: number;
  readonly width?: number;
  readonly height?: number;
}

export function defaultDoor(id: string, wallId: string, draft: DoorDraft = {}): Door {
  return Object.freeze({
    id,
    wallId,
    offset: draft.offset ?? 600,
    width: draft.width ?? 800,
    height: draft.height ?? 2100,
  });
}

export function emptyDoorEditorState(): DoorEditorState {
  return Object.freeze({
    doors: [],
    selectedDoorId: null,
  });
}

