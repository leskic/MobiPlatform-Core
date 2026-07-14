import type { Module, ModuleInput } from "../types/ProjectTypes";

export class ModuleFactory {
  static create(input: ModuleInput): Module {
    return { ...structuredClone(input), parts: [], hardwares: [] };
  }
}
