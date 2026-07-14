import type { Architecture, Vector3 } from "../../../builder/types/ProjectTypes";
import { fromArchitecture as wallFromArchitecture, wallLength } from "../../mobi-studio-walls/src/WallGeometry";
import type { OpeningDescriptor } from "./OpeningTypes";

const EPS = 1e-7;
export function pointOnWall(wall: Architecture, offset: number, sillHeight: number): Vector3 {
  const descriptor = wallFromArchitecture(wall), length = wallLength(descriptor.start, descriptor.end);
  const ratio = length < EPS ? 0 : offset / length;
  return { x: descriptor.start.x + (descriptor.end.x - descriptor.start.x) * ratio, y: descriptor.start.y + sillHeight, z: descriptor.start.z + (descriptor.end.z - descriptor.start.z) * ratio };
}
export function openingOffset(opening: Architecture, wall: Architecture): number {
  const descriptor = wallFromArchitecture(wall), dx = descriptor.end.x - descriptor.start.x, dz = descriptor.end.z - descriptor.start.z, length = Math.hypot(dx, dz);
  return length < EPS ? 0 : ((opening.position.x - descriptor.start.x) * dx + (opening.position.z - descriptor.start.z) * dz) / length;
}
export function toOpeningArchitecture(opening: OpeningDescriptor, wall: Architecture): Architecture {
  if (!opening.hostWallId) throw new Error("OPENING_WITHOUT_WALL");
  if (opening.width <= 0 || opening.height <= 0 || opening.sillHeight < 0) throw new Error("INVALID_OPENING_DIMENSIONS");
  return { id: opening.id, parentId: opening.environmentId, type: "opening", hostId: opening.hostWallId, size: { width: opening.width, height: opening.height, depth: wall.size.depth }, position: pointOnWall(wall, opening.offset, opening.sillHeight), rotation: structuredClone(wall.rotation), referencePlane: structuredClone(wall.position), finish: opening.finish };
}
export function fromOpeningArchitecture(opening: Architecture, wall: Architecture): OpeningDescriptor {
  return { id: opening.id, environmentId: opening.parentId, hostWallId: opening.hostId ?? "", offset: openingOffset(opening, wall), sillHeight: opening.position.y - wall.position.y, width: opening.size.width, height: opening.size.height, finish: opening.finish };
}

