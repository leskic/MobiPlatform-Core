import type { Architecture } from "../../../../builder/types/ProjectTypes";
import type { WallEditorState } from "../walls/WallModel";
import type { DoorEditorState } from "./DoorModel";

export class DoorSerializer {
  toArchitectures(doors: DoorEditorState, walls: WallEditorState, environmentId: string, wallArchitectureIds: Readonly<Record<string, string>>): readonly Architecture[] {
    return doors.doors.flatMap((door, index) => {
      const wall = walls.walls.find((item) => item.id === door.wallId);
      const hostId = wallArchitectureIds[door.wallId];
      if (!wall || !hostId) return [];
      const radians = wall.rotation * Math.PI / 180;
      return [Object.freeze({
        id: doorId(index),
        parentId: environmentId,
        type: "opening" as const,
        hostId,
        size: { width: door.width, height: door.height, depth: wall.thickness },
        position: {
          x: wall.x + Math.cos(radians) * door.offset,
          y: wall.y + Math.sin(radians) * door.offset,
          z: 0,
        },
        rotation: { x: 0, y: 0, z: wall.rotation },
        referencePlane: referencePlane(wall.rotation),
        finish: "door-opening",
      })];
    });
  }
}

function doorId(index: number): string {
  return `9d0e6a20-12a2-4f5f-bd3a-0000000010${String(11 + index).padStart(2, "0")}`;
}

function referencePlane(rotation: number) {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized === 90) return { x: 1, y: 0, z: 0 };
  if (normalized === 180) return { x: 0, y: -1, z: 0 };
  if (normalized === 270) return { x: -1, y: 0, z: 0 };
  return { x: 0, y: 1, z: 0 };
}

