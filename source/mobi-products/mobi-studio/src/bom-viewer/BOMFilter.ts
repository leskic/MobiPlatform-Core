import type { PublicBOMLine } from "../industrial-integration/IndustrialContracts";

export interface BOMFilterOptions {
  readonly query?: string;
  readonly kinds?: readonly PublicBOMLine["kind"][];
  readonly keys?: readonly string[];
  readonly sortBy?: "id" | "kind" | "key" | "quantity";
  readonly direction?: "ASC" | "DESC";
}

export class BOMFilter {
  apply(
    lines: readonly PublicBOMLine[],
    options: Readonly<BOMFilterOptions> = {},
  ): readonly PublicBOMLine[] {
    const query = options.query?.trim().toLocaleLowerCase();
    const filtered = lines.filter((line) => {
      if (options.kinds?.length && !options.kinds.includes(line.kind)) return false;
      if (options.keys?.length && !options.keys.includes(line.key)) return false;
      if (!query) return true;
      return [line.id, line.kind, line.key, ...line.sourceEntityIds]
        .some((value) => value.toLocaleLowerCase().includes(query));
    });

    if (!options.sortBy) return structuredClone(filtered);
    const factor = options.direction === "DESC" ? -1 : 1;
    return structuredClone(filtered).sort((left, right) =>
      factor * this.compare(left[options.sortBy!], right[options.sortBy!]),
    );
  }

  private compare(left: string | number, right: string | number): number {
    return typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right));
  }
}
