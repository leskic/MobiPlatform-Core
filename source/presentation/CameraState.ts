import type { CameraSnapshot, Projection, Vector3State } from "./interfaces/PresentationTypes";
type CameraView = Omit<CameraSnapshot, "namedViews">;
export class CameraState {
  private position: Vector3State = { x: 0, y: 0, z: 1000 }; private target: Vector3State = { x: 0, y: 0, z: 0 };
  private zoom = 1; private projection: Projection = "perspective"; private namedViews: Record<string, CameraView> = {};
  set(position: Vector3State, target: Vector3State, zoom: number, projection: Projection): void { if (zoom <= 0) throw new Error("Camera zoom must be positive"); this.position = structuredClone(position); this.target = structuredClone(target); this.zoom = zoom; this.projection = projection; }
  save(name: string): void { this.namedViews[name] = { position: structuredClone(this.position), target: structuredClone(this.target), zoom: this.zoom, projection: this.projection }; }
  load(name: string): void { const view = this.namedViews[name]; if (!view) throw new Error(`Camera view not found: ${name}`); this.set(view.position, view.target, view.zoom, view.projection); }
  get(): CameraSnapshot { return structuredClone({ position: this.position, target: this.target, zoom: this.zoom, projection: this.projection, namedViews: this.namedViews }); }
}
