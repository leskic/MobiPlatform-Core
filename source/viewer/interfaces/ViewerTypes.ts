import type { BufferGeometry, Camera, Object3D, Scene, Vector3 } from "three";
import type { CameraSnapshot, PresentationSnapshot, SceneNodeSnapshot, Vector3State } from "../../presentation/interfaces/PresentationTypes";

export interface RenderBackend {
  render(scene: Scene, camera: Camera): void;
  setSize(width: number, height: number): void;
  dispose(): void;
}

export interface FrameScheduler {
  request(callback: () => void): unknown;
  cancel(handle: unknown): void;
}

export interface GeometrySource {
  get(node: SceneNodeSnapshot): BufferGeometry | undefined;
}

export interface CameraProposal {
  position: Vector3State;
  target: Vector3State;
  zoom: number;
  projection: CameraSnapshot["projection"];
}

export interface ViewerSnapshot {
  sessionId: string;
  active: boolean;
  presentation: PresentationSnapshot;
  renderedNodeIds: string[];
  renderCount: number;
}

export interface SceneUpdateResult {
  added: string[];
  updated: string[];
  removed: string[];
}

export type RenderableNode = Object3D & { userData: { nodeId?: string; category?: string; layerId?: string; groupId?: string } };

export interface FrameBounds {
  center: Vector3;
  size: Vector3;
}
