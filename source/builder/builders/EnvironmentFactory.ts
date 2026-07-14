import type { Environment, EnvironmentInput } from "../types/ProjectTypes";

export class EnvironmentFactory {
  static create(input: EnvironmentInput): Environment {
    return { ...structuredClone(input), architectures: [], infrastructures: [], modules: [] };
  }
}
