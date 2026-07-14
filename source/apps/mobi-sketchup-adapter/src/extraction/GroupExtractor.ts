import type { SketchUpEntityInput } from "../interfaces/SketchUpAdapterTypes"; import type { EntityExtractor } from "./EntityExtractor";
export class GroupExtractor { constructor(private readonly entities: EntityExtractor) {} extract(input: readonly SketchUpEntityInput[]): SketchUpEntityInput[] { return this.entities.flatten(input).filter(entity => entity.kind === "group"); } }
