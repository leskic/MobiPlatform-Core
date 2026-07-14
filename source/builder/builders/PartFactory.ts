import type { Part } from "../types/ProjectTypes";

export class PartFactory {
  static create(input: Part): Part {
    return structuredClone(input);
  }
}
