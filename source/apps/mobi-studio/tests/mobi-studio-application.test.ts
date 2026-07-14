import type { Camera, Scene } from "three";
import { describe, expect, it, vi } from "vitest";
import { ProjectBuilder } from "../../../builder/ProjectBuilder";
import { architectureInput, environmentInput, hardwareInput, ids, infrastructureInput, moduleInput, partInput, projectInput } from "../../../builder/tests/fixture";
import { MobiCopilot } from "../../../copilot/MobiCopilot"; import { Suggestion } from "../../../copilot/Suggestion";
import { MobiOrigin } from "../../../origin/MobiOrigin"; import { PresentationCore } from "../../../presentation/PresentationCore"; import { SceneNode } from "../../../presentation/SceneNode"; import { MobiStudio } from "../../../studio/MobiStudio"; import { SyncManager } from "../../../sync/SyncManager"; import { Viewer } from "../../../viewer/Viewer"; import type { FrameScheduler, RenderBackend } from "../../../viewer/interfaces/ViewerTypes";
import { EditIntent } from "../src/editor/EditIntent"; import { EditPreview } from "../src/editor/EditPreview"; import { EditorState } from "../src/editor/EditorState"; import { StudioApplicationEvent } from "../src/events/StudioApplicationEvent"; import { StudioEventBus } from "../src/events/StudioEventBus"; import { KeyboardInteraction } from "../src/interaction/KeyboardInteraction"; import { PointerInteraction } from "../src/interaction/PointerInteraction"; import { ShortcutRegistry } from "../src/interaction/ShortcutRegistry"; import { MobiStudioApplication } from "../src/MobiStudioApplication"; import { StudioCommandBus } from "../src/StudioCommandBus"; import { TransactionFeedback } from "../src/transactions/TransactionFeedback"; import { TransactionRequestFactory } from "../src/transactions/TransactionRequestFactory"; import { DockManager } from "../src/ui/DockManager"; import { PropertyGrid } from "../src/ui/PropertyGrid"; import { ThemeManager } from "../src/ui/ThemeManager";

class Backend implements RenderBackend { renders = 0; size = [0, 0]; disposed = false; render(_scene: Scene, _camera: Camera): void { this.renders += 1; } setSize(width: number, height: number): void { this.size = [width, height]; } dispose(): void { this.disposed = true; } }
class Scheduler implements FrameScheduler { callbacks: Array<() => void> = []; request(callback: () => void): unknown { this.callbacks.push(callback); return this.callbacks.length; } cancel(): void {} flush(): void { this.callbacks.splice(0).forEach(callback => callback()); } }
const validProject = () => new ProjectBuilder().createProject(projectInput).addEnvironment(environmentInput).addArchitecture(ids.environment, architectureInput).addInfrastructure(ids.environment, infrastructureInput).addModule(ids.environment, moduleInput).addPart(ids.module, partInput).addHardware(ids.module, hardwareInput).build();

function setup(rule = false) {
  const origin = new MobiOrigin(); const foundation = new MobiStudio(origin); const presentation = new PresentationCore(); presentation.createSession("presentation");
  const backend = new Backend(); const scheduler = new Scheduler(); const viewer = new Viewer(presentation, backend, scheduler);
  const copilot = new MobiCopilot(origin, foundation, rule ? [{ code: "TEST", analyze: () => [new Suggestion("TEST", "warning", "/entities/module", "Review")]}] : []);
  const sync = new SyncManager(origin); const app = new MobiStudioApplication({ origin, foundation, presentation, viewer, copilot, sync });
  return { app, origin, foundation, presentation, viewer, backend, scheduler, copilot, sync };
}

const previewIntent = (origin: MobiOrigin, fail = false) => ({
  id: fail ? "tx-fail" : "tx-ok", entityId: ids.project, property: "displayName", value: "Changed", author: "tester", logicalTimestamp: 10, operationName: "rename-project",
  preview: { apply: (presentation: PresentationCore) => presentation.repository.view.set({ wireframe: true }), revert: (presentation: PresentationCore) => presentation.repository.view.set({ wireframe: false }) },
  operation: () => { if (fail) { origin.clearProject(); throw new Error("forced failure"); } const project = origin.getProject(); project.displayName = "Changed"; origin.openProject(JSON.stringify(project)); }
});

describe("Mobi Studio Application v1", () => {
  it("initializes the headless shell, layout and frozen Foundation facade", () => {
    const { app } = setup(); expect(app.foundation).toBeInstanceOf(MobiStudio); expect(app.getState()).toMatchObject({ active: false, theme: "light", editing: false });
    expect(app.shell.get().layout).toEqual({ left: ["project-tree"], center: ["viewer"], right: ["inspector", "property-grid"], bottom: ["copilot", "transactions", "status"] });
  });

  it("creates and closes isolated application and Viewer sessions", () => {
    const { app, scheduler } = setup(); app.startSession("studio-1"); scheduler.flush(); expect(app.getState()).toMatchObject({ sessionId: "studio-1", active: true }); expect(app.viewerHost.get().active).toBe(true);
    app.endSession(); expect(app.getState().active).toBe(false); expect(app.viewerHost.get().active).toBe(false); expect(() => app.endSession()).toThrow("No Studio application session");
  });

  it("publishes defensive application events and supports unsubscribe", () => {
    const { app } = setup(); const events: string[] = []; const listener = (event: { type: string }) => events.push(event.type); app.subscribe(listener); app.startSession("s"); app.setTheme("dark"); app.unsubscribe(listener); app.execute({ name: "undo-placeholder" }); expect(events).toEqual(["SESSION_STARTED", "THEME_CHANGED"]);
  });

  it("selects from ProjectTree and synchronizes the official SelectionModel", () => {
    const { app, presentation } = setup(); const root = new SceneNode("project", ids.project, "Project", "project"); root.add(new SceneNode("module", ids.module, "Module", "module")); presentation.repository.scene.set([root]);
    expect(app.tree.get()[0]?.children[0]?.category).toBe("module"); app.tree.select("module"); expect(presentation.repository.selection.get().ids).toEqual(["module"]); expect(app.inspector.get()?.id).toBe("module");
    app.tree.select("project", true); expect(presentation.repository.selection.get().ids).toEqual(["module", "project"]);
  });

  it("creates EditIntent and preview without mutating Projeto.mobi, then cancels", () => {
    const { app, origin, presentation } = setup(); app.startSession("s"); origin.newProject(validProject()); const before = origin.getProject(); const intent = app.propertyGrid.createIntent(previewIntent(origin));
    expect(intent.get()).toMatchObject({ property: "displayName", value: "Changed" }); app.beginEdit(intent.input); expect(presentation.repository.view.get().wireframe).toBe(true); expect(origin.getProject()).toEqual(before); expect(app.getState().editing).toBe(true);
    app.cancelEdit(); expect(presentation.repository.view.get().wireframe).toBe(false); expect(origin.getProject()).toEqual(before);
  });

  it("generates a TransactionRequest, commits through Transaction Engine and updates feedback", () => {
    const { app, origin, presentation } = setup(); app.startSession("s"); origin.newProject(validProject()); app.beginEdit(previewIntent(origin)); const result = app.commitEdit();
    expect(result.status).toBe("COMMITTED"); expect(result.request).toMatchObject({ source: "mobi-studio", status: "PREPARED", strategy: "ACCEPT_INTERNAL" }); expect(origin.getProject().displayName).toBe("Changed"); expect(presentation.repository.view.get().wireframe).toBe(true); expect(app.transactionPanel.get().status).toBe("COMMITTED");
  });

  it("rolls back atomically, restores preview and reports the error", () => {
    const { app, origin, presentation } = setup(); app.startSession("s"); origin.newProject(validProject()); const before = origin.getProject(); app.beginEdit(previewIntent(origin, true)); const result = app.commitEdit();
    expect(result.status).toBe("ROLLED_BACK"); expect(origin.getProject()).toEqual(before); expect(presentation.repository.view.get().wireframe).toBe(false); expect(app.getState()).toMatchObject({ status: "Rolled back", editing: false, transaction: { status: "ROLLED_BACK", message: "forced failure" } });
  });

  it("hosts Viewer 2.0 without direct rendering and reacts to commands", () => {
    const { app, presentation, scheduler, backend } = setup(); app.startSession("s"); scheduler.flush(); app.viewerHost.resize(640, 480); scheduler.flush(); expect(backend.size).toEqual([640, 480]);
    app.execute({ name: "select", payload: "node" }); scheduler.flush(); expect(presentation.repository.selection.get().ids).toEqual(["node"]); expect(backend.renders).toBeGreaterThan(0);
  });

  it("dispatches visibility, placeholders and custom commands", () => {
    const { app, presentation } = setup(); app.startSession("s"); app.execute({ name: "hide", payload: "a" }); expect(presentation.repository.visibility.get().hidden).toEqual(["a"]); app.execute({ name: "show", payload: "a" }); app.execute({ name: "isolate", payload: ["b"] }); expect(presentation.repository.visibility.get().isolated).toEqual(["b"]); app.execute({ name: "restore-visibility" }); expect(presentation.repository.visibility.get().isolated).toEqual([]);
    expect(app.execute({ name: "new-project" })).toBe("REQUIRES_PROJECT_INPUT"); expect(app.execute({ name: "redo-placeholder" })).toBe("NOT_IMPLEMENTED"); expect(app.publishNavigableProject()).toBe("NOT_IMPLEMENTED"); expect(app.execute({ name: "publish-navigable-project-placeholder" })).toBe("NOT_IMPLEMENTED");
    app.commands.register("custom", payload => `ok:${String(payload)}`); expect(app.commands.supports("custom")).toBe(true); expect(app.commands.dispatch({ name: "custom", payload: 1 })).toBe("ok:1"); expect(app.commands.listCustom()).toEqual(["custom"]); app.commands.unregister("custom");
  });

  it("supports clear-selection and direct interaction contracts", () => {
    const { app, presentation } = setup(); app.startSession("s"); app.interactions.selection.select("a"); app.interactions.selection.select("b", true); expect(presentation.repository.selection.get().ids).toEqual(["a", "b"]); app.execute({ name: "clear-selection" }); expect(presentation.repository.selection.get().ids).toEqual([]);
    app.pointer.begin(); app.pointer.update({ x: 2 }); expect(app.pointer.confirm()).toEqual({ x: 2 }); expect(() => app.pointer.update(1)).toThrow("not active"); expect(() => app.pointer.confirm()).toThrow("not active"); app.pointer.begin(); app.pointer.cancel();
  });

  it("supports configurable shortcuts", () => { const registry = new ShortcutRegistry(); registry.register("Ctrl+S", "save-project"); expect(new KeyboardInteraction(registry).commandFor("Ctrl+S")).toBe("save-project"); expect(registry.list()).toEqual({ "Ctrl+S": "save-project" }); registry.unregister("Ctrl+S"); expect(registry.resolve("Ctrl+S")).toBeUndefined(); expect(() => registry.register(" ", "save-project")).toThrow("cannot be empty"); });

  it("supports Light/Dark themes and basic docking", () => { const theme = new ThemeManager(); expect(theme.get()).toBe("light"); expect(theme.toggle()).toBe("dark"); theme.set("light"); const dock = new DockManager(); dock.dock("a", "left"); dock.hide("a"); expect(dock.get().visible.a).toBe(false); dock.show("a"); dock.remove("a"); expect(dock.get().panels).toEqual({}); expect(() => dock.hide("missing")).toThrow("not found"); expect(() => dock.show("missing")).toThrow("not found"); });

  it("prepares Inspector and PropertyGrid without domain rules", () => { const { app, presentation } = setup(); app.propertyGrid.set([{ name: "displayName", value: "A", editable: true }]); const copy = app.propertyGrid.get(); copy[0]!.value = "B"; expect(app.propertyGrid.get()[0]?.value).toBe("A"); expect(app.inspector.get()).toBeNull(); presentation.repository.selection.select("missing"); expect(app.inspector.get()).toBeNull(); });

  it("consumes Copilot suggestions without automatic correction", () => { const { app, origin, copilot } = setup(true); app.startSession("s"); origin.newProject(validProject()); copilot.createSession("c"); copilot.startAnalysis(); copilot.analyzeProject(); expect(app.copilotPanel.get().suggestions[0]?.severity).toBe("warning"); app.copilotPanel.selectRelated(0); expect(app.getState().selectedIds).toEqual(["module"]); expect(() => app.copilotPanel.selectRelated(9)).toThrow("Suggestion not found"); });

  it("validates events, intents, previews, feedback and request factory", () => {
    expect(() => new StudioApplicationEvent("SESSION_STARTED", -1)).toThrow("non-negative"); expect(new StudioApplicationEvent("SESSION_STARTED", 0, "x").get().detail).toBe("x"); const bus = new StudioEventBus(); const listener = vi.fn(); bus.subscribe(listener); bus.publish({ type: "SESSION_STARTED", logicalTimestamp: 0 }); bus.unsubscribe(listener); bus.clear(); expect(listener).toHaveBeenCalledOnce();
    expect(() => new EditIntent({ ...previewIntent(new MobiOrigin()), id: "" })).toThrow("cannot be empty"); expect(() => new EditIntent({ ...previewIntent(new MobiOrigin()), logicalTimestamp: -1 })).toThrow("non-negative");
    const presentation = new PresentationCore(); const preview = new EditPreview({ apply: () => {}, revert: () => {} }); preview.start(presentation); expect(preview.isActive()).toBe(true); expect(() => preview.start(presentation)).toThrow("already active"); preview.cancel(presentation); preview.cancel(presentation); preview.finish();
    const state = new EditorState(); expect(state.get()).toBeNull(); const origin = new MobiOrigin(); const intent = new EditIntent(previewIntent(origin)); state.set(intent.get()); expect(state.editing).toBe(true); state.clear(); const request = new TransactionRequestFactory().create(intent); expect(request.destination).toBe("mobi-origin"); const feedback = new TransactionFeedback(); expect(feedback.get().status).toBe("IDLE"); feedback.clear();
  });
});
