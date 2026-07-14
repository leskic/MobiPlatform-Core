import type { GrainDirection, Part, Project } from "../../../builder/types/ProjectTypes";
import type { PresentationCore } from "../../../presentation/PresentationCore";
import type { MobiStudioApplication } from "../../mobi-studio/src/MobiStudioApplication";
import type { EditIntentInput } from "../../mobi-studio/src/interfaces/StudioApplicationTypes";
import { IntentEditSession } from "./IntentEditSession";
import type { IntentEditErrorCode, IntentEditResult } from "./IntentEditTypes";
import { SnapshotManager } from "./SnapshotManager";

const GRAIN_DIRECTIONS: readonly GrainDirection[] = ["lengthwise", "crosswise", "none"];

export class IntentEditController {
  readonly session = new IntentEditSession();
  private readonly snapshots: SnapshotManager;
  constructor(private readonly studio: MobiStudioApplication, private readonly presentation: PresentationCore) { this.snapshots = new SnapshotManager(presentation); }

  initiateEdit(author: string, logicalTimestamp: number): IntentEditResult {
    if (this.session.get()) return this.failure("EDIT_ALREADY_ACTIVE");
    let project: Project;
    try { project = this.studio.foundation.getProject(); } catch { return this.failure("NO_PROJECT"); }
    const selection = this.presentation.repository.selection.get().ids;
    if (selection.length === 0) return this.failure("EMPTY_SELECTION");
    if (selection.length > 1) return this.failure("MULTIPLE_SELECTION");
    const entityId = selection[0]!;
    const part = this.findPart(project, entityId);
    if (!part) return this.failure(this.hasNonPartEntity(project, entityId) ? "ENTITY_NOT_PART" : "PART_NOT_FOUND");
    const visualSnapshot = this.snapshots.capture();
    this.session.start(entityId, part.grainDirection, author, logicalTimestamp, visualSnapshot);
    const input: EditIntentInput = {
      id: `grain-direction:${entityId}:${logicalTimestamp}`,
      entityId,
      property: "grainDirection",
      value: part.grainDirection,
      author,
      logicalTimestamp,
      operationName: "UPDATE_PART_GRAIN_DIRECTION",
      operation: origin => {
        const active = this.session.require();
        const updated = origin.getProject();
        const target = this.findPart(updated, active.targetEntityId);
        if (!target) throw new Error("PART_NOT_FOUND");
        target.grainDirection = active.proposedValue;
        origin.openProject(JSON.stringify(updated));
      },
      preview: {
        apply: () => this.snapshots.applyEditing(entityId, logicalTimestamp),
        revert: () => this.snapshots.restore(visualSnapshot, logicalTimestamp)
      }
    };
    this.studio.beginEdit(input);
    return { success: true, code: "PREVIEW_STARTED", session: this.session.get() };
  }

  updateGrainDirection(value: unknown): IntentEditResult {
    if (!this.session.get()) return this.failure("NO_ACTIVE_EDIT");
    if (!this.isGrainDirection(value)) return this.failure("INVALID_GRAIN_DIRECTION");
    this.session.propose(value);
    return { success: true, code: "PREVIEW_UPDATED", session: this.session.get() };
  }

  commit(): IntentEditResult {
    const active = this.session.get();
    if (!active) return this.failure("NO_ACTIVE_EDIT");
    this.session.transition("PENDING");
    const transaction = this.studio.commitEdit();
    const phase = transaction.success ? "COMMITTED" : "ROLLED_BACK";
    this.session.transition(phase);
    this.snapshots.restore(active.visualSnapshot, active.logicalTimestamp);
    const terminal = this.session.get();
    this.session.clear();
    return transaction.success
      ? { success: true, code: "COMMITTED", session: terminal, transaction }
      : { success: false, code: "TRANSACTION_ROLLED_BACK", session: terminal, transaction };
  }

  rollback(): IntentEditResult {
    const active = this.session.get();
    if (!active) return this.failure("NO_ACTIVE_EDIT");
    this.studio.cancelEdit();
    this.session.transition("CANCELLED");
    const terminal = this.session.get();
    this.session.clear();
    return { success: true, code: "CANCELLED", session: terminal };
  }

  private isGrainDirection(value: unknown): value is GrainDirection { return typeof value === "string" && GRAIN_DIRECTIONS.includes(value as GrainDirection); }
  private findPart(project: Project, id: string): Part | undefined { for (const environment of project.environments) for (const module of environment.modules) { const part = module.parts.find(candidate => candidate.id === id); if (part) return part; } return undefined; }
  private hasNonPartEntity(project: Project, id: string): boolean { if (project.id === id) return true; for (const environment of project.environments) { if (environment.id === id) return true; if (environment.architectures.some(value => value.id === id) || environment.infrastructures.some(value => value.id === id) || environment.modules.some(value => value.id === id || value.hardwares.some(hardware => hardware.id === id))) return true; } return false; }
  private failure(code: IntentEditErrorCode): IntentEditResult { return { success: false, code, session: this.session.get() }; }
}
