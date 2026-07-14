import { BoxGeometry, Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, type Camera, type Scene } from "three";
import { describe, expect, it, vi } from "vitest";
import { PresentationCore } from "../../presentation/PresentationCore";
import { SceneNode } from "../../presentation/SceneNode";
import { CameraController } from "../CameraController";
import { GeometryCache } from "../GeometryCache";
import { MaterialManager } from "../MaterialManager";
import { RenderLoop } from "../RenderLoop";
import { SceneRenderer } from "../SceneRenderer";
import { SelectionRenderer } from "../SelectionRenderer";
import { Viewer } from "../Viewer";
import { ViewerSession } from "../ViewerSession";
import { VisibilityRenderer } from "../VisibilityRenderer";
import type { FrameScheduler, RenderBackend } from "../interfaces/ViewerTypes";

class Backend implements RenderBackend {
  renderCount = 0; size: [number, number] = [0, 0]; disposed = false; lastCamera?: Camera; lastScene?: Scene;
  render(scene: Scene, camera: Camera): void { this.renderCount += 1; this.lastScene = scene; this.lastCamera = camera; }
  setSize(width: number, height: number): void { this.size = [width, height]; }
  dispose(): void { this.disposed = true; }
}

class Scheduler implements FrameScheduler {
  callbacks: Array<() => void> = []; cancelled: unknown[] = [];
  request(callback: () => void): unknown { this.callbacks.push(callback); return this.callbacks.length; }
  cancel(handle: unknown): void { this.cancelled.push(handle); }
  flush(): void { const callbacks = this.callbacks.splice(0); callbacks.forEach(callback => callback()); }
}

const setup = (): { core: PresentationCore; viewer: Viewer; backend: Backend; scheduler: Scheduler } => {
  const core = new PresentationCore(); core.createSession("presentation-1");
  const backend = new Backend(); const scheduler = new Scheduler();
  const viewer = new Viewer(core, backend, scheduler, { get: () => new BoxGeometry(10, 20, 30) });
  return { core, viewer, backend, scheduler };
};

const populate = (core: PresentationCore): void => {
  const project = new SceneNode("project", "project-entity", "Project", "project");
  const environment = new SceneNode("environment", "environment-entity", "Kitchen", "environment");
  const module = new SceneNode("module", "module-entity", "Cabinet", "module");
  environment.add(module); project.add(environment); core.repository.scene.set([project]);
};

describe("Mobi Viewer 2.0", () => {
  it("renders the Presentation Core scene without mutating its state", () => {
    const { core, viewer, backend, scheduler } = setup(); populate(core); const before = core.getState();
    viewer.open("viewer-1"); scheduler.flush();
    expect(viewer.getState().renderedNodeIds).toEqual(["project", "environment", "module"]);
    expect(backend.renderCount).toBe(1); expect(core.getState()).toEqual(before);
  });

  it("coalesces events into one on-demand frame and performs incremental updates", () => {
    const { core, viewer, scheduler } = setup(); populate(core); viewer.open("viewer-1"); scheduler.flush();
    core.controller.notify("SceneChanged", 1); core.controller.notify("ViewChanged", 2);
    expect(scheduler.callbacks).toHaveLength(1); scheduler.flush(); expect(viewer.getState().renderCount).toBe(2);
    core.repository.scene.clear(); core.controller.notify("SceneChanged", 3); scheduler.flush();
    expect(viewer.scene.ids()).toEqual([]);
  });

  it("derives simple, multiple and hover selection exclusively from SelectionModel", () => {
    const { core, viewer, scheduler } = setup(); populate(core); viewer.open("v"); scheduler.flush();
    core.repository.selection.selectMany(["environment", "module"]); core.controller.notify("SelectionChanged", 1); scheduler.flush();
    expect(viewer.scene.get("environment")?.userData.selected).toBe(true);
    expect(viewer.scene.get("project")?.userData.selected).toBe(false);
    viewer.hover("project"); scheduler.flush(); expect(viewer.scene.get("project")?.userData.hovered).toBe(true);
    viewer.hover(undefined); scheduler.flush(); expect(viewer.scene.get("project")?.userData.hovered).toBe(false);
  });

  it("derives hidden, restored, isolated and category visibility without private visibility state", () => {
    const { core, viewer, scheduler } = setup(); populate(core); viewer.open("v"); scheduler.flush();
    core.repository.visibility.hide("module"); core.controller.notify("VisibilityChanged", 1); scheduler.flush(); expect(viewer.scene.get("module")?.visible).toBe(false);
    core.repository.visibility.restore(); core.repository.visibility.isolate(["environment"]); core.controller.notify("VisibilityChanged", 2); scheduler.flush();
    expect(viewer.scene.get("environment")?.visible).toBe(true); expect(viewer.scene.get("project")?.visible).toBe(false);
    core.repository.visibility.restore(); core.repository.visibility.setCategory("module", false); core.controller.notify("VisibilityChanged", 3); scheduler.flush(); expect(viewer.scene.get("module")?.visible).toBe(false);
  });

  it("supports layer and group visibility metadata when supplied by a render adapter", () => {
    const object = new SceneNode("one", "entity", "One", "part"); const cache = new GeometryCache(); const materials = new MaterialManager();
    const scene = new SceneRenderer(cache, materials, { get: () => new BoxGeometry() }); scene.update({ roots: [object.get()] }, { exploded: false, sections: false, wireframe: false, shadows: true, materials: true, mode: "inspection" });
    const rendered = scene.get("one"); if (!rendered) throw new Error("Expected node"); rendered.userData.layerId = "layer"; rendered.userData.groupId = "group";
    new VisibilityRenderer().apply(scene.values(), { hidden: [], isolated: [], layers: { layer: false }, groups: { group: true }, categories: {} }); expect(rendered.visible).toBe(false);
    new VisibilityRenderer().apply(scene.values(), { hidden: [], isolated: [], layers: { layer: true }, groups: { group: false }, categories: {} }); expect(rendered.visible).toBe(false);
    materials.dispose(); cache.clear();
  });

  it("synchronizes perspective, orthographic, zoom and viewport size from CameraState", () => {
    const { core, viewer, backend, scheduler } = setup(); populate(core); viewer.open("v"); viewer.setSize(800, 400); scheduler.flush();
    expect(backend.size).toEqual([800, 400]); expect(backend.lastCamera).toBeInstanceOf(PerspectiveCamera);
    core.repository.camera.set({ x: 10, y: 20, z: 30 }, { x: 1, y: 2, z: 3 }, 2, "orthographic"); core.controller.notify("CameraChanged", 1); scheduler.flush();
    expect(backend.lastCamera).toBeInstanceOf(OrthographicCamera); expect(backend.lastCamera?.position.toArray()).toEqual([10, 20, 30]);
    expect(() => viewer.setSize(0, 1)).toThrow("Viewer size must be positive");
  });

  it("computes immutable orbit, pan, zoom and framing proposals", () => {
    const camera = new CameraController(); const current = { position: { x: 0, y: 0, z: 10 }, target: { x: 0, y: 0, z: 0 }, zoom: 1, projection: "perspective" as const, namedViews: {} };
    expect(camera.orbit(current, Math.PI / 2, 0).position.x).toBeCloseTo(10);
    expect(camera.pan(current, 2, 3)).toMatchObject({ position: { x: 2, y: 3, z: 10 }, target: { x: 2, y: 3, z: 0 } });
    expect(camera.zoom(current, 2).zoom).toBe(2); expect(() => camera.zoom(current, 0)).toThrow("positive");
    camera.sync(current); expect(camera.getCamera()).toBeInstanceOf(PerspectiveCamera);
    const empty = camera.frame(current, []); expect(empty.position).toEqual(current.position);
    const meshScene = new SceneRenderer(new GeometryCache(), new MaterialManager(), { get: () => new BoxGeometry(10, 10, 10) }); meshScene.update({ roots: [new SceneNode("n", "e", "N", "part").get()] }, { exploded: false, sections: false, wireframe: false, shadows: false, materials: false, mode: "production" });
    expect(camera.frame(current, meshScene.values()).target).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("applies wireframe, materials, shadows and visual explode from ViewState", () => {
    const { core, viewer, scheduler } = setup(); populate(core); viewer.open("v"); scheduler.flush();
    core.repository.view.set({ wireframe: true, shadows: false, materials: false, mode: "production", exploded: true, sections: true }); core.controller.notify("ViewChanged", 1); scheduler.flush();
    expect(viewer.scene.isExploded()).toBe(true); expect(viewer.scene.get("module")?.position.x).toBe(50); expect(viewer.scene.scene.userData.sections).toBe(true); expect(viewer.scene.scene.userData.mode).toBe("production");
    const mesh = viewer.scene.get("module")?.children[0]; expect(mesh?.frustumCulled).toBe(true);
  });

  it("keeps highlight materials isolated and resolves every visual material mode", () => {
    const manager = new MaterialManager(); const inspection = manager.resolve({ exploded: false, sections: false, wireframe: false, shadows: false, materials: false, mode: "inspection" });
    const production = manager.resolve({ exploded: false, sections: false, wireframe: false, shadows: false, materials: false, mode: "production" });
    const standard = manager.resolve({ exploded: false, sections: false, wireframe: false, shadows: true, materials: true, mode: "inspection" });
    expect(inspection).not.toBe(production); expect(standard).not.toBe(inspection);
    const first = new Mesh(new BoxGeometry(), new MeshBasicMaterial()); const second = new Mesh(new BoxGeometry(), [new MeshBasicMaterial()]);
    first.userData.nodeId = "a"; second.userData.nodeId = "b";
    new SelectionRenderer().apply([first, second] as never, { ids: ["a"] }); expect(first.userData.selected).toBe(true); expect(second.userData.selected).toBe(false);
    manager.dispose();
  });

  it("manages geometry cache disposal deterministically", () => {
    const cache = new GeometryCache(); const first = new BoxGeometry(); const second = new BoxGeometry(); const disposeFirst = vi.spyOn(first, "dispose"); const disposeSecond = vi.spyOn(second, "dispose");
    cache.set("a", first); expect(cache.has("a")).toBe(true); expect(cache.get("a")).toBe(first); cache.set("a", second); expect(disposeFirst).toHaveBeenCalledOnce();
    expect(cache.delete("missing")).toBe(false); expect(cache.delete("a")).toBe(true); expect(disposeSecond).toHaveBeenCalledOnce(); expect(cache.size).toBe(0);
    cache.set("b", new BoxGeometry()); cache.clear(); expect(cache.size).toBe(0);
  });

  it("isolates sessions and cleans resources and subscriptions", () => {
    const first = setup(); const second = setup(); populate(first.core); first.viewer.open("first"); second.viewer.open("second"); first.scheduler.flush(); second.scheduler.flush();
    expect(first.viewer.getState().renderedNodeIds).toHaveLength(3); expect(second.viewer.getState().renderedNodeIds).toHaveLength(0);
    first.viewer.close(); expect(first.viewer.getState().active).toBe(false); expect(() => first.viewer.render()).toThrow("No viewer session");
    first.viewer.dispose(); expect(first.backend.disposed).toBe(true); second.viewer.dispose();
  });

  it("validates session lifecycle and cancels pending frames", () => {
    const session = new ViewerSession(); expect(() => session.open(" ")).toThrow("cannot be empty"); expect(() => session.close()).toThrow("No viewer session");
    session.open("x"); expect(session.require()).toBe("x"); session.close(); expect(() => session.require()).toThrow("No viewer session");
    const scheduler = new Scheduler(); const render = vi.fn(); const loop = new RenderLoop(scheduler, render); loop.request(); loop.request(); expect(loop.isPending()).toBe(true); loop.cancel(); expect(scheduler.cancelled).toEqual([1]); expect(loop.isPending()).toBe(false); loop.cancel();
  });

  it("requires an active Presentation Core session", () => {
    const core = new PresentationCore(); const viewer = new Viewer(core, new Backend(), new Scheduler()); expect(() => viewer.open("viewer")).toThrow("No presentation session"); viewer.dispose();
  });
});
