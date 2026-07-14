import type { PublicBOMLine } from "../industrial-integration/IndustrialContracts";
import type { SelectionController } from "../mobi-studio-selection/SelectionController";

export type BOMSelectionResult =
  | { readonly success: true; readonly entityId: string }
  | { readonly success: false; readonly code: "INVALID_SOURCE_ENTITY_ID" };

export class BOMSelectionBridge {
  constructor(private readonly selection: SelectionController) {}

  select(line: Readonly<PublicBOMLine>, sourceEntityId: string): BOMSelectionResult {
    if (!sourceEntityId.trim() || !line.sourceEntityIds.includes(sourceEntityId)) {
      return { success: false, code: "INVALID_SOURCE_ENTITY_ID" };
    }
    try {
      this.selection.select(sourceEntityId);
      return { success: true, entityId: sourceEntityId };
    } catch (error) {
      if (error instanceof Error && error.message === "ENTITY_NOT_VISIBLE") {
        return { success: false, code: "INVALID_SOURCE_ENTITY_ID" };
      }
      throw error;
    }
  }

  clear(): void {
    this.selection.clear();
  }
}
