import type { PublicBOMLine } from "../industrial-integration/IndustrialContracts";
import type { BOMViewerGroup } from "./BOMViewerViewModel";

export type BOMGroupingMode = "NONE" | "KIND" | "KEY";

export class BOMGrouping {
  group(lines: readonly PublicBOMLine[], mode: BOMGroupingMode): readonly BOMViewerGroup[] {
    if (mode === "NONE") return [];
    const groups = new Map<string, PublicBOMLine[]>();
    for (const line of lines) {
      const key = mode === "KIND" ? line.kind : line.key;
      groups.set(key, [...(groups.get(key) ?? []), structuredClone(line)]);
    }
    return [...groups].map(([key, groupedLines]) => ({ key, lines: groupedLines }));
  }
}
