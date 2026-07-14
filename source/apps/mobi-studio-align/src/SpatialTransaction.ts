import type { Part, Project } from "../../../builder/types/ProjectTypes";
import type { PresentationCore } from "../../../presentation/PresentationCore";
import type { TransactionResultSnapshot } from "../../../transaction/interfaces/TransactionTypes";
import type { MobiStudioApplication } from "../../mobi-studio/src/MobiStudioApplication";
import type { EditIntentInput } from "../../mobi-studio/src/interfaces/StudioApplicationTypes";

export type SpatialMutation = (project: Project) => void;
export interface SpatialToolResult { success: boolean; code: "COMMITTED" | "ROLLED_BACK" | "NOTHING_TO_UNDO" | "NOTHING_TO_REDO"; transaction?: TransactionResultSnapshot }
interface HistoryEntry { before: string; after: string; ids: string[]; operation: string; timestamp: number; author: string }

export class PartCollisionPolicy {
  validate(project: Project, affectedIds: readonly string[]): void {
    const affected = new Set(affectedIds);
    for (const environment of project.environments) for (const module of environment.modules) {
      for (let left = 0; left < module.parts.length; left += 1) for (let right = left + 1; right < module.parts.length; right += 1) {
        const a = module.parts[left]!; const b = module.parts[right]!;
        if ((affected.has(a.id) || affected.has(b.id)) && this.overlaps(a, b)) throw new Error(`COLLISION:${a.id}:${b.id}`);
      }
    }
  }
  private overlaps(a: Part, b: Part): boolean {
    return a.position.x < b.position.x + b.size.width && a.position.x + a.size.width > b.position.x
      && a.position.y < b.position.y + b.size.height && a.position.y + a.size.height > b.position.y
      && a.position.z < b.position.z + b.size.thickness && a.position.z + a.size.thickness > b.position.z;
  }
}

export class SpatialTransaction {
  private readonly history: HistoryEntry[] = []; private readonly future: HistoryEntry[] = [];
  constructor(private readonly studio: MobiStudioApplication, private readonly presentation: PresentationCore, private readonly collision = new PartCollisionPolicy()) {}
  execute(operation: string, ids: readonly string[], mutation: SpatialMutation, author: string, timestamp: number): SpatialToolResult {
    if (ids.length === 0) throw new Error("EMPTY_SELECTION");
    const before = JSON.stringify(this.studio.foundation.getProject()); const visual = this.presentation.getState();
    const input: EditIntentInput = {
      id: `${operation}:${timestamp}`, entityId: ids.join(","), property: "spatial", value: structuredClone(ids), author, logicalTimestamp: timestamp, operationName: operation,
      preview: {
        apply: () => { this.presentation.repository.selection.selectMany(ids); this.presentation.repository.view.set({ mode: "inspection" }); this.notify(timestamp); },
        revert: () => this.restoreVisual(visual.selection.ids, visual.view, timestamp)
      },
      operation: origin => { const project = origin.getProject(); mutation(project); this.collision.validate(project, ids); origin.openProject(JSON.stringify(project)); }
    };
    this.studio.beginEdit(input); const transaction = this.studio.commitEdit(); this.restoreVisual(visual.selection.ids, visual.view, timestamp);
    if (!transaction.success) return { success: false, code: "ROLLED_BACK", transaction };
    const after = JSON.stringify(this.studio.foundation.getProject()); this.history.push({ before, after, ids: [...ids], operation, timestamp, author }); this.future.splice(0);
    return { success: true, code: "COMMITTED", transaction };
  }
  undo(): SpatialToolResult { const entry = this.history.pop(); if (!entry) return { success: false, code: "NOTHING_TO_UNDO" }; const result = this.replace(entry.before, `UNDO_${entry.operation}`, entry.ids, entry.author, entry.timestamp + 1); if (result.success) this.future.push(entry); return result; }
  redo(): SpatialToolResult { const entry = this.future.pop(); if (!entry) return { success: false, code: "NOTHING_TO_REDO" }; const result = this.replace(entry.after, `REDO_${entry.operation}`, entry.ids, entry.author, entry.timestamp + 2); if (result.success) this.history.push(entry); return result; }
  parts(project: Project, ids: readonly string[]): Part[] { const found: Part[] = []; for (const environment of project.environments) for (const module of environment.modules) for (const part of module.parts) if (ids.includes(part.id)) found.push(part); if (found.length !== ids.length) throw new Error("ENTITY_NOT_PART"); return found; }
  private replace(serialized: string, operation: string, ids: string[], author: string, timestamp: number): SpatialToolResult {
    const visual = this.presentation.getState(); const input: EditIntentInput = { id: `${operation}:${timestamp}`, entityId: ids.join(","), property: "spatial-history", value: null, author, logicalTimestamp: timestamp, operationName: operation, preview: { apply: () => {}, revert: () => this.restoreVisual(visual.selection.ids, visual.view, timestamp) }, operation: origin => origin.openProject(serialized) };
    this.studio.beginEdit(input); const transaction = this.studio.commitEdit(); this.restoreVisual(visual.selection.ids, visual.view, timestamp); const code = (["ROLLED_BACK", "COMMITTED"] as const)[Number(transaction.success)]!; return { success: transaction.success, code, transaction };
  }
  private restoreVisual(ids: string[], view: typeof this.presentation.repository.view extends { get(): infer T } ? T : never, timestamp: number): void { this.presentation.repository.selection.selectMany(ids); this.presentation.repository.view.set(view); this.notify(timestamp); }
  private notify(timestamp: number): void { this.presentation.controller.notify("SelectionChanged", timestamp); this.presentation.controller.notify("ViewChanged", timestamp); }
}
