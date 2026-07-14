import type { Infrastructure } from "../types/ProjectTypes";

export class InfrastructureFactory {
  static create(input: Infrastructure): Infrastructure {
    return structuredClone(input);
  }
}
