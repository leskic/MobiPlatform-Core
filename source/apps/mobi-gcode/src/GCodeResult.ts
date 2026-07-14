import type { GCodeResultSnapshot } from "./interfaces/GCodeTypes";
export class GCodeResult { constructor(private readonly value: GCodeResultSnapshot) {} get(): GCodeResultSnapshot { return structuredClone(this.value); } }
