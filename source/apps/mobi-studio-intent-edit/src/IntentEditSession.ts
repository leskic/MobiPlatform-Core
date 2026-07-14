import type { GrainDirection } from "../../../builder/types/ProjectTypes";
import type { IntentEditPhase, IntentEditSessionSnapshot, IntentVisualSnapshot } from "./IntentEditTypes";

export class IntentEditSession {
  private state: IntentEditSessionSnapshot | null = null;
  start(targetEntityId: string, value: GrainDirection, author: string, logicalTimestamp: number, visualSnapshot: IntentVisualSnapshot): void {
    if (this.state) throw new Error("EDIT_ALREADY_ACTIVE");
    this.state = { targetEntityId, property: "grainDirection", originalValue: value, proposedValue: value, author, logicalTimestamp, visualSnapshot: structuredClone(visualSnapshot), phase: "PREVIEW" };
  }
  propose(value: GrainDirection): void { this.require().proposedValue = value; }
  transition(phase: Exclude<IntentEditPhase, "IDLE">): void { this.require().phase = phase; }
  get(): IntentEditSessionSnapshot | null { return structuredClone(this.state); }
  require(): IntentEditSessionSnapshot { if (!this.state) throw new Error("NO_ACTIVE_EDIT"); return this.state; }
  clear(): void { this.state = null; }
}
