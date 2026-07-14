import { PartFactory } from "../../../../builder/builders/PartFactory"; import type { Part } from "../../../../builder/types/ProjectTypes";
export class PartBuilder { build(input: Part): Part { return PartFactory.create(structuredClone(input)); } }
