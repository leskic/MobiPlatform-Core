import type { PresentationCore } from "../../../presentation/PresentationCore";
import type { IntentVisualSnapshot } from "./IntentEditTypes";

export class SnapshotManager {
  constructor(private readonly presentation: PresentationCore) {}
  capture(): IntentVisualSnapshot { return { selection: this.presentation.repository.selection.get(), view: this.presentation.repository.view.get() }; }
  applyEditing(entityId: string, logicalTimestamp: number): void { this.presentation.repository.selection.select(entityId); this.presentation.repository.view.set({ mode: "inspection" }); this.presentation.controller.notify("SelectionChanged", logicalTimestamp); this.presentation.controller.notify("ViewChanged", logicalTimestamp); }
  restore(snapshot: IntentVisualSnapshot, logicalTimestamp: number): void { this.presentation.repository.selection.selectMany(snapshot.selection.ids); this.presentation.repository.view.set(snapshot.view); this.presentation.controller.notify("SelectionChanged", logicalTimestamp); this.presentation.controller.notify("ViewChanged", logicalTimestamp); }
}
