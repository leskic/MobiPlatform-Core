import type { Camera, Scene } from "three";
import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../../builder/ProjectBuilder";
import { architectureInput, environmentInput, hardwareInput, ids, infrastructureInput, moduleInput, partInput, projectInput } from "../../../builder/tests/fixture";
import { MobiCopilot } from "../../../copilot/MobiCopilot";
import { MobiOrigin } from "../../../origin/MobiOrigin";
import { PresentationCore } from "../../../presentation/PresentationCore";
import { MobiStudio } from "../../../studio/MobiStudio";
import { SyncManager } from "../../../sync/SyncManager";
import { Viewer } from "../../../viewer/Viewer";
import type { FrameScheduler, RenderBackend } from "../../../viewer/interfaces/ViewerTypes";
import { MobiStudioApplication } from "../../mobi-studio/src/MobiStudioApplication";
import { IntentEditController } from "../src/IntentEditController";
import { IntentEditSession } from "../src/IntentEditSession";
import { SnapshotManager } from "../src/SnapshotManager";

class Backend implements RenderBackend { render(_scene: Scene, _camera: Camera): void {} setSize(): void {} dispose(): void {} }
class Scheduler implements FrameScheduler { request(): unknown { return 1; } cancel(): void {} }
const validProject = () => new ProjectBuilder().createProject(projectInput).addEnvironment(environmentInput).addArchitecture(ids.environment, architectureInput).addInfrastructure(ids.environment, infrastructureInput).addModule(ids.environment, moduleInput).addPart(ids.module, partInput).addHardware(ids.module, hardwareInput).build();

function setup(openProject = true) {
  const origin = new MobiOrigin(); const foundation = new MobiStudio(origin); const presentation = new PresentationCore(); presentation.createSession("presentation");
  const viewer = new Viewer(presentation, new Backend(), new Scheduler()); const copilot = new MobiCopilot(origin, foundation); const sync = new SyncManager(origin);
  const studio = new MobiStudioApplication({ origin, foundation, presentation, viewer, copilot, sync }); studio.startSession("studio");
  if (openProject) foundation.openProject(JSON.stringify(validProject()));
  presentation.repository.selection.select(ids.part);
  return { controller: new IntentEditController(studio, presentation), studio, presentation, origin, foundation };
}

describe("Mobi Studio Intent-Edit Extension v1", () => {
  it.each(["lengthwise", "crosswise", "none"] as const)("commits official grainDirection %s through Studio TransactionCoordinator", value => {
    const { controller, origin } = setup(); expect(controller.initiateEdit("operator", 10).code).toBe("PREVIEW_STARTED"); expect(controller.updateGrainDirection(value).code).toBe("PREVIEW_UPDATED");
    const result = controller.commit(); expect(result).toMatchObject({ success: true, code: "COMMITTED", session: { targetEntityId: ids.part, property: "grainDirection", originalValue: partInput.grainDirection, proposedValue: value, author: "operator", logicalTimestamp: 10, phase: "COMMITTED" }, transaction: { status: "COMMITTED" } });
    expect(result.transaction?.request.source).toBe("mobi-studio"); expect(result.transaction?.log.events.map(event => event.state)).toEqual(["BEGIN", "VALIDATE", "EXECUTE", "COMMIT", "FINISH"]);
    expect(origin.getProject().environments[0]?.modules[0]?.parts[0]?.grainDirection).toBe(value); expect(controller.session.get()).toBeNull();
  });

  it("keeps preview volatile and restores SelectionSnapshot and ViewSnapshot on cancel", () => {
    const { controller, presentation, origin } = setup(); presentation.repository.selection.selectMany([ids.part]); presentation.repository.view.set({ wireframe: true, mode: "production" }); const beforeVisual = presentation.getState(); const beforeProject = origin.getProject();
    const started = controller.initiateEdit("operator", 11); expect(started.session).toMatchObject({ visualSnapshot: { selection: beforeVisual.selection, view: beforeVisual.view }, phase: "PREVIEW" }); expect(presentation.repository.view.get().mode).toBe("inspection");
    controller.updateGrainDirection("crosswise"); expect(origin.getProject()).toEqual(beforeProject); const cancelled = controller.rollback(); expect(cancelled).toMatchObject({ success: true, code: "CANCELLED", session: { phase: "CANCELLED" } }); expect(presentation.getState().selection).toEqual(beforeVisual.selection); expect(presentation.getState().view).toEqual(beforeVisual.view); expect(origin.getProject()).toEqual(beforeProject);
  });

  it("rolls back atomically through TransactionCoordinator and clears provisional state", () => {
    const { controller, foundation, origin, presentation } = setup(); const visual = presentation.getState(); controller.initiateEdit("operator", 12); controller.updateGrainDirection("crosswise"); const changed = foundation.getProject(); changed.environments[0]!.modules[0]!.parts = []; foundation.openProject(JSON.stringify(changed)); const beforeTransaction = origin.getProject();
    const result = controller.commit(); expect(result).toMatchObject({ success: false, code: "TRANSACTION_ROLLED_BACK", session: { phase: "ROLLED_BACK" }, transaction: { status: "ROLLED_BACK", success: false } }); expect(result.transaction?.log.events.map(event => event.state)).toEqual(["BEGIN", "VALIDATE", "EXECUTE", "ROLLBACK", "FINISH"]); expect(origin.getProject()).toEqual(beforeTransaction); expect(controller.session.get()).toBeNull(); expect(presentation.getState().selection).toEqual(visual.selection); expect(presentation.getState().view).toEqual(visual.view);
  });

  it("rejects grainDirection outside the official enum", () => { const { controller } = setup(); controller.initiateEdit("operator", 1); expect(controller.updateGrainDirection("diagonal")).toMatchObject({ success: false, code: "INVALID_GRAIN_DIRECTION" }); });
  it("rejects an absent project", () => { const { controller } = setup(false); expect(controller.initiateEdit("operator", 1)).toMatchObject({ success: false, code: "NO_PROJECT" }); });
  it("rejects empty selection", () => { const { controller, presentation } = setup(); presentation.repository.selection.clear(); expect(controller.initiateEdit("operator", 1)).toMatchObject({ success: false, code: "EMPTY_SELECTION" }); });
  it("rejects multiple selection", () => { const { controller, presentation } = setup(); presentation.repository.selection.selectMany([ids.part, ids.module]); expect(controller.initiateEdit("operator", 1)).toMatchObject({ success: false, code: "MULTIPLE_SELECTION" }); });
  it("rejects a selected entity that is not Part", () => { const { controller, presentation } = setup(); presentation.repository.selection.select(ids.module); expect(controller.initiateEdit("operator", 1)).toMatchObject({ success: false, code: "ENTITY_NOT_PART" }); });
  it("rejects an unknown selected Part identifier", () => { const { controller, presentation } = setup(); presentation.repository.selection.select("00000000-0000-4000-8000-000000000099"); expect(controller.initiateEdit("operator", 1)).toMatchObject({ success: false, code: "PART_NOT_FOUND" }); });
  it("blocks concurrent edits and operations without a session", () => { const { controller } = setup(); expect(controller.updateGrainDirection("none").code).toBe("NO_ACTIVE_EDIT"); expect(controller.commit().code).toBe("NO_ACTIVE_EDIT"); expect(controller.rollback().code).toBe("NO_ACTIVE_EDIT"); controller.initiateEdit("operator", 1); expect(controller.initiateEdit("operator", 2).code).toBe("EDIT_ALREADY_ACTIVE"); });

  it("emits public Presentation Core events for apply and restore", () => { const { controller, presentation } = setup(); const events: string[] = []; presentation.controller.subscribe(event => events.push(event.type)); controller.initiateEdit("operator", 2); controller.rollback(); expect(events).toEqual(["SelectionChanged", "ViewChanged", "SelectionChanged", "ViewChanged"]); });
  it("uses defensive session and snapshot contracts", () => { const { presentation } = setup(); const snapshots = new SnapshotManager(presentation); const visual = snapshots.capture(); visual.selection.ids.push("changed"); expect(presentation.repository.selection.get().ids).not.toContain("changed"); const session = new IntentEditSession(); session.start(ids.part, "none", "operator", 1, snapshots.capture()); expect(() => session.start(ids.part, "none", "operator", 1, snapshots.capture())).toThrow("EDIT_ALREADY_ACTIVE"); const copy = session.get()!; copy.proposedValue = "crosswise"; expect(session.get()?.proposedValue).toBe("none"); session.propose("lengthwise"); session.transition("PENDING"); expect(session.require().phase).toBe("PENDING"); session.clear(); expect(() => session.require()).toThrow("NO_ACTIVE_EDIT"); });
});
