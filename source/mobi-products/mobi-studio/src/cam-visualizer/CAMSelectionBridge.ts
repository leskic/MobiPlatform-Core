import type { NeutralCAMOperation } from "../industrial-integration/IndustrialContracts";
import type { SelectionController } from "../mobi-studio-selection/SelectionController";

export type CAMSelectionResult =
  | { readonly success: true; readonly entityId: string }
  | { readonly success: false; readonly code: "CAM_ENTITY_NOT_VISIBLE" };

export class CAMSelectionBridge {
  constructor(private readonly selection: SelectionController) {}

  select(operation: Readonly<NeutralCAMOperation>): CAMSelectionResult {
    try {
      this.selection.select(operation.entityId);
      return { success: true, entityId: operation.entityId };
    } catch (error) {
      if (error instanceof Error && error.message === "ENTITY_NOT_VISIBLE") {
        return { success: false, code: "CAM_ENTITY_NOT_VISIBLE" };
      }
      throw error;
    }
  }

  clear(): void {
    this.selection.clear();
  }
}
