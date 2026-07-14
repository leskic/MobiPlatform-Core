import type { ToolpathOperationSnapshot } from "../../../mobi-cam/src/interfaces/CAMTypes";
export class CommandGenerator { coordinates(operation: ToolpathOperationSnapshot): { x: number; y: number; z: number } { const point = operation.position ?? operation.contour?.points[0] ?? operation.region?.contour.points[0] ?? { x: 0, y: 0 }; return { x: point.x, y: point.y, z: -operation.depth }; } }
