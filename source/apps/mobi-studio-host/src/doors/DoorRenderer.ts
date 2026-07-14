import type { WallEditorState } from "../walls/WallModel";
import type { DoorEditorState } from "./DoorModel";

export class DoorRenderer {
  render(doors: DoorEditorState, walls: WallEditorState): string {
    return doors.doors.map((door) => {
      const wall = walls.walls.find((item) => item.id === door.wallId);
      if (!wall) return "";
      const radians = wall.rotation * Math.PI / 180;
      const x = wall.x + Math.cos(radians) * door.offset;
      const y = wall.y + Math.sin(radians) * door.offset;
      const selected = door.id === doors.selectedDoorId ? " selected" : "";
      return `<rect data-door-id="${door.id}" class="door-marker${selected}" x="${x / 10}" y="${y / 10 - 5}" width="${door.width / 10}" height="10" transform="rotate(${wall.rotation} ${x / 10} ${y / 10})" />`;
    }).join("");
  }
}

