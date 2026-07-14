import type { WallEditorState } from "../walls/WallModel";
import { snap } from "../walls/WallCommands";
import { defaultDoor, type Door, type DoorDraft, type DoorEditorState } from "./DoorModel";

export class DoorCommands {
  private history: DoorEditorState[];
  private cursor = 0;
  private nextId = 1;

  constructor(initial: DoorEditorState) {
    this.history = [initial];
  }

  current(): DoorEditorState {
    return this.history[this.cursor]!;
  }

  addDoor(walls: WallEditorState, draft: DoorDraft = {}): DoorEditorState {
    const wallId = draft.wallId ?? walls.selectedWallId ?? walls.walls[0]?.id;
    if (!wallId) return this.current();
    const door = defaultDoor(this.allocateId(), wallId, this.snapDraft(draft, walls));
    return this.commit({ doors: [...this.current().doors, door], selectedDoorId: door.id });
  }

  selectDoor(id: string | null): DoorEditorState {
    if (id !== null && !this.current().doors.some((door) => door.id === id)) return this.current();
    return this.commit({ ...this.current(), selectedDoorId: id });
  }

  moveSelected(delta: number, walls: WallEditorState): DoorEditorState {
    const selected = this.current().selectedDoorId;
    if (!selected) return this.current();
    return this.updateDoor(selected, walls, (door) => ({ ...door, offset: door.offset + delta }));
  }

  editSelected(draft: DoorDraft, walls: WallEditorState): DoorEditorState {
    const selected = this.current().selectedDoorId;
    if (!selected) return this.current();
    return this.updateDoor(selected, walls, (door) => ({ ...door, ...draft }));
  }

  deleteSelected(): DoorEditorState {
    const selected = this.current().selectedDoorId;
    if (!selected) return this.current();
    return this.commit({
      doors: this.current().doors.filter((door) => door.id !== selected),
      selectedDoorId: null,
    });
  }

  undo(): DoorEditorState {
    this.cursor = Math.max(0, this.cursor - 1);
    return this.current();
  }

  redo(): DoorEditorState {
    this.cursor = Math.min(this.history.length - 1, this.cursor + 1);
    return this.current();
  }

  private updateDoor(id: string, walls: WallEditorState, update: (door: Door) => Door): DoorEditorState {
    return this.commit({
      doors: this.current().doors.map((door) => door.id === id ? Object.freeze(this.normalize(update(door), walls)) : door),
      selectedDoorId: id,
    });
  }

  private normalize(door: Door, walls: WallEditorState): Door {
    const wall = walls.walls.find((item) => item.id === door.wallId) ?? walls.walls[0];
    const maxOffset = Math.max(0, (wall?.length ?? 0) - door.width);
    return Object.freeze({
      ...door,
      offset: Math.min(maxOffset, Math.max(0, snap(door.offset))),
      width: Math.max(500, snap(door.width)),
      height: Math.max(1800, snap(door.height)),
    });
  }

  private snapDraft(draft: DoorDraft, walls: WallEditorState): DoorDraft {
    const next: Record<string, string | number> = {};
    if (draft.wallId !== undefined) next.wallId = draft.wallId;
    if (draft.offset !== undefined) next.offset = snap(draft.offset);
    if (draft.width !== undefined) next.width = snap(draft.width);
    if (draft.height !== undefined) next.height = snap(draft.height);
    if (next.wallId === undefined) return next;
    const wall = walls.walls.find((item) => item.id === next.wallId);
    if (!wall || next.offset === undefined || next.width === undefined) return next;
    return { ...next, offset: Math.min(Math.max(0, wall.length - Number(next.width)), Number(next.offset)) };
  }

  private commit(next: DoorEditorState): DoorEditorState {
    const frozen = Object.freeze({
      doors: next.doors.map((door) => Object.freeze({ ...door })),
      selectedDoorId: next.selectedDoorId,
    });
    this.history = [...this.history.slice(0, this.cursor + 1), frozen];
    this.cursor = this.history.length - 1;
    return frozen;
  }

  private allocateId(): string {
    return `door-${this.nextId++}`;
  }
}
