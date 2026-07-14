import type { Architecture } from "../../../../builder/types/ProjectTypes";
import type { WallEditorState } from "./WallModel";

export class WallSerializer {
  toArchitectures(state: WallEditorState, environmentId: string): readonly Architecture[] {
    return state.walls.map((wall, index) => Object.freeze({
      id: wallId(index),
      parentId: environmentId,
      type: "wall" as const,
      hostId: null,
      size: { width: wall.length, height: wall.height, depth: wall.thickness },
      position: { x: wall.x, y: wall.y, z: 0 },
      rotation: { x: 0, y: 0, z: wall.rotation },
      referencePlane: referencePlane(wall.rotation),
      finish: "paint-white",
    }));
  }
}

function wallId(index: number): string {
  return `9d0e6a20-12a2-4f5f-bd3a-0000000009${String(11 + index).padStart(2, "0")}`;
}

function referencePlane(rotation: number) {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized === 90) return { x: 1, y: 0, z: 0 };
  if (normalized === 180) return { x: 0, y: -1, z: 0 };
  if (normalized === 270) return { x: -1, y: 0, z: 0 };
  return { x: 0, y: 1, z: 0 };
}
