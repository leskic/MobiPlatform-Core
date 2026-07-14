import { describe, expect, it, vi } from "vitest";
import { CameraState } from "../CameraState";
import { PresentationCore } from "../PresentationCore";
import { PresentationEvent } from "../PresentationEvent";
import { PresentationSession } from "../PresentationSession";
import { SceneNode } from "../SceneNode";
import { SelectionModel } from "../SelectionModel";
import { ViewState } from "../ViewState";
import { VisibilityState } from "../VisibilityState";

describe("Mobi Presentation Core Foundation", () => {
  it("creates and closes sessions", () => {
    const core = new PresentationCore();
    expect(core.session.get()).toEqual({ id: "", active: false });
    expect(core.createSession("presentation-1")).toEqual({ id: "presentation-1", active: true });
    expect(core.closeSession()).toEqual({ id: "", active: false });
  });
  it("builds a visual tree with Project.mobi references", () => {
    const root = new SceneNode("visual-project", "project-id", "Project", "project");
    const environment = new SceneNode("visual-env", "environment-id", "Kitchen", "environment");
    environment.add(new SceneNode("visual-part", "part-id", "Side", "part")); root.add(environment);
    const core = new PresentationCore(); core.repository.scene.set([root]);
    expect(core.repository.scene.ids()).toEqual(["visual-project", "visual-env", "visual-part"]);
    expect(core.getState().scene.roots[0]?.children[0]?.projectEntityId).toBe("environment-id");
    core.repository.scene.clear(); expect(core.repository.scene.ids()).toEqual([]);
  });
  it("supports single, multiple, additive, clear and inverted selection", () => {
    const selection = new SelectionModel(); selection.select("a"); expect(selection.get().ids).toEqual(["a"]);
    selection.selectMany(["a", "b", "b"]); selection.add("c"); expect(selection.get().ids).toEqual(["a", "b", "c"]);
    selection.invert(["a", "b", "c", "d"]); expect(selection.get().ids).toEqual(["d"]);
    selection.clear(); expect(selection.get().ids).toEqual([]);
  });
  it("controls visibility, isolation, layers, groups and categories", () => {
    const visibility = new VisibilityState(); visibility.hide("a"); visibility.show("a"); visibility.hide("b");
    visibility.isolate(["c"]); visibility.setLayer("electrical", false); visibility.setGroup("kitchen", true); visibility.setCategory("part", false);
    expect(visibility.get()).toEqual({ hidden: ["b"], isolated: ["c"], layers: { electrical: false }, groups: { kitchen: true }, categories: { part: false } });
    visibility.restore(); expect(visibility.get().hidden).toEqual([]); expect(visibility.get().isolated).toEqual([]);
  });
  it("stores camera state and named views", () => {
    const camera = new CameraState(); camera.set({ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0 }, 2, "orthographic"); camera.save("front");
    camera.set({ x: 9, y: 9, z: 9 }, { x: 1, y: 1, z: 1 }, 1, "perspective"); camera.load("front");
    expect(camera.get()).toEqual(expect.objectContaining({ position: { x: 1, y: 2, z: 3 }, zoom: 2, projection: "orthographic" }));
    expect(() => camera.set({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 0, "perspective")).toThrow("positive");
    expect(() => camera.load("missing")).toThrow("not found");
  });
  it("stores all view modes", () => {
    const view = new ViewState(); view.set({ exploded: true, sections: true, wireframe: true, shadows: false, materials: false, mode: "production" });
    expect(view.get()).toEqual({ exploded: true, sections: true, wireframe: true, shadows: false, materials: false, mode: "production" });
  });
  it("publishes all official events and supports unsubscribe", () => {
    const core = new PresentationCore(); core.createSession("session"); const listener = vi.fn(); core.controller.subscribe(listener);
    ["SelectionChanged", "VisibilityChanged", "CameraChanged", "ViewChanged", "SceneChanged"].forEach((type, index) => core.controller.notify(type as Parameters<typeof core.controller.notify>[0], index));
    expect(listener).toHaveBeenCalledTimes(5); core.controller.unsubscribe(listener); core.controller.notify("ViewChanged", 5); expect(listener).toHaveBeenCalledTimes(5);
  });
  it("returns defensive repository snapshots", () => {
    const core = new PresentationCore(); core.repository.selection.select("a"); const state = core.getState(); state.selection.ids.push("b"); state.camera.position.x = 99;
    expect(core.getState().selection.ids).toEqual(["a"]); expect(core.getState().camera.position.x).toBe(0);
  });
  it("isolates repositories and sessions", () => {
    const first = new PresentationCore(); const second = new PresentationCore(); first.createSession("first"); first.repository.selection.select("a");
    expect(second.session.get().active).toBe(false); expect(second.getState().selection.ids).toEqual([]);
  });
  it("clears listeners when closing a session", () => {
    const core = new PresentationCore(); core.createSession("session"); const listener = vi.fn(); core.controller.subscribe(listener); core.closeSession(); core.createSession("next"); core.controller.notify("SceneChanged", 1); expect(listener).not.toHaveBeenCalled();
  });
  it("validates sessions, nodes and logical timestamps", () => {
    expect(() => new SceneNode(" ", "x", "x", "part")).toThrow("cannot be empty"); const session = new PresentationSession();
    expect(() => session.create(" ")).toThrow("cannot be empty"); expect(() => session.require()).toThrow("No presentation"); expect(() => session.close()).toThrow("No presentation");
    expect(() => new PresentationEvent("SceneChanged", "s", -1)).toThrow("non-negative"); expect(() => new PresentationEvent("SceneChanged", "s", 1.2)).toThrow("non-negative");
  });
  it("requires an active session before notification", () => {
    const core = new PresentationCore(); expect(() => core.controller.notify("SceneChanged", 0)).toThrow("No presentation");
  });
});
