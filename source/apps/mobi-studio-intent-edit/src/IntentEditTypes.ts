import type { GrainDirection } from "../../../builder/types/ProjectTypes";
import type { SelectionSnapshot, ViewSnapshot } from "../../../presentation/interfaces/PresentationTypes";
import type { TransactionResultSnapshot } from "../../../transaction/interfaces/TransactionTypes";

export type IntentEditPhase = "IDLE" | "PREVIEW" | "PENDING" | "COMMITTED" | "ROLLED_BACK" | "CANCELLED";
export interface IntentVisualSnapshot { selection: SelectionSnapshot; view: ViewSnapshot }
export interface IntentEditSessionSnapshot {
  targetEntityId: string;
  property: "grainDirection";
  originalValue: GrainDirection;
  proposedValue: GrainDirection;
  author: string;
  logicalTimestamp: number;
  visualSnapshot: IntentVisualSnapshot;
  phase: Exclude<IntentEditPhase, "IDLE">;
}
export type IntentEditErrorCode = "NO_PROJECT" | "EMPTY_SELECTION" | "MULTIPLE_SELECTION" | "ENTITY_NOT_PART" | "PART_NOT_FOUND" | "INVALID_GRAIN_DIRECTION" | "EDIT_ALREADY_ACTIVE" | "NO_ACTIVE_EDIT";
export type IntentEditSuccessCode = "PREVIEW_STARTED" | "PREVIEW_UPDATED" | "COMMITTED" | "TRANSACTION_ROLLED_BACK" | "CANCELLED";
export interface IntentEditResult {
  success: boolean;
  code: IntentEditErrorCode | IntentEditSuccessCode;
  session: IntentEditSessionSnapshot | null;
  transaction?: TransactionResultSnapshot;
}
