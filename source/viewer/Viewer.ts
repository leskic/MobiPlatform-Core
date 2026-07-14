import type { PresentationCore } from "../presentation/PresentationCore";
import type { PresentationEventSnapshot, PresentationListener } from "../presentation/interfaces/PresentationTypes";
import { CameraController } from "./CameraController"; import { GeometryCache } from "./GeometryCache"; import { MaterialManager } from "./MaterialManager"; import { RenderLoop } from "./RenderLoop"; import { SceneRenderer } from "./SceneRenderer"; import { SelectionRenderer } from "./SelectionRenderer"; import { ViewerRenderer } from "./ViewerRenderer"; import { ViewerRepository } from "./ViewerRepository"; import { ViewerSession } from "./ViewerSession"; import { VisibilityRenderer } from "./VisibilityRenderer";
import type { FrameScheduler, GeometrySource, RenderBackend, ViewerSnapshot } from "./interfaces/ViewerTypes";

export class Viewer {
  readonly session = new ViewerSession(); readonly repository: ViewerRepository; readonly camera = new CameraController(); readonly geometry = new GeometryCache();
  readonly scene: SceneRenderer; readonly selection = new SelectionRenderer(); readonly visibility = new VisibilityRenderer(); readonly materials = new MaterialManager(); readonly renderer: ViewerRenderer; readonly loop: RenderLoop;
  private readonly listener: PresentationListener;
  constructor(private readonly presentation: PresentationCore, backend: RenderBackend, scheduler: FrameScheduler, geometrySource?: GeometrySource) {
    this.repository = new ViewerRepository(presentation.repository); this.scene = new SceneRenderer(this.geometry, this.materials, geometrySource);
    this.renderer = new ViewerRenderer(backend, this.scene, this.camera, this.selection, this.visibility); this.loop = new RenderLoop(scheduler, () => this.render());
    this.listener = (_event: PresentationEventSnapshot): void => { if (this.session.isActive()) this.loop.request(); };
  }
  open(id: string): void { this.presentation.session.require(); this.session.open(id); this.presentation.controller.subscribe(this.listener); this.loop.request(); }
  close(): void { this.presentation.controller.unsubscribe(this.listener); this.loop.cancel(); this.session.close(); this.scene.clear(); }
  render(): void { this.session.require(); this.renderer.render(this.repository.getPresentation()); }
  setSize(width: number, height: number): void { this.renderer.setSize(width, height); this.loop.request(); }
  hover(id: string | undefined): void { this.selection.setHover(id); this.loop.request(); }
  getState(): ViewerSnapshot { return { sessionId: this.session.isActive() ? this.session.require() : "", active: this.session.isActive(), presentation: this.repository.getPresentation(), renderedNodeIds: this.scene.ids(), renderCount: this.renderer.getRenderCount() }; }
  dispose(): void { if (this.session.isActive()) this.close(); this.geometry.clear(); this.materials.dispose(); this.renderer.dispose(); }
}
