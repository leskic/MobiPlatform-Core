import type { Camera } from "three";
import type { PresentationSnapshot } from "../presentation/interfaces/PresentationTypes";
import type { RenderBackend } from "./interfaces/ViewerTypes";
import type { CameraController } from "./CameraController";
import type { SceneRenderer } from "./SceneRenderer";
import type { SelectionRenderer } from "./SelectionRenderer";
import type { VisibilityRenderer } from "./VisibilityRenderer";

export class ViewerRenderer {
  private count = 0; private aspect = 1;
  constructor(private readonly backend: RenderBackend, private readonly scene: SceneRenderer, private readonly camera: CameraController, private readonly selection: SelectionRenderer, private readonly visibility: VisibilityRenderer) {}
  setSize(width: number, height: number): void { if (width <= 0 || height <= 0) throw new Error("Viewer size must be positive"); this.aspect = width / height; this.backend.setSize(width, height); }
  render(snapshot: PresentationSnapshot): Camera {
    this.scene.update(snapshot.scene, snapshot.view); this.visibility.apply(this.scene.values(), snapshot.visibility); this.selection.apply(this.scene.values(), snapshot.selection);
    const camera = this.camera.sync(snapshot.camera, this.aspect); this.backend.render(this.scene.scene, camera); this.count += 1; return camera;
  }
  getRenderCount(): number { return this.count; }
  dispose(): void { this.backend.dispose(); }
}
