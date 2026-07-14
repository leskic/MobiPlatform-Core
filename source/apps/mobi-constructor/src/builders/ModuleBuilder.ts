import { ModuleFactory } from "../../../../builder/builders/ModuleFactory"; import type { Module, ModuleInput } from "../../../../builder/types/ProjectTypes";
export class ModuleBuilder { build(input: ModuleInput): Module { return ModuleFactory.create(structuredClone(input)); } }
