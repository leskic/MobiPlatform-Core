import { EnvironmentFactory } from "../../../../builder/builders/EnvironmentFactory"; import type { Environment, EnvironmentInput } from "../../../../builder/types/ProjectTypes";
export class EnvironmentBuilder { build(input: EnvironmentInput): Environment { return EnvironmentFactory.create(structuredClone(input)); } }
