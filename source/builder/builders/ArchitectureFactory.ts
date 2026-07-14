import type { Architecture } from "../types/ProjectTypes";

export class ArchitectureFactory {
  static create(input: Architecture): Architecture {
    return structuredClone(input);
  }
}
