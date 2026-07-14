import type { DoorEditorState } from "./DoorModel";

export class DoorSelection {
  selected(state: DoorEditorState) {
    return state.doors.find((door) => door.id === state.selectedDoorId) ?? null;
  }
}

