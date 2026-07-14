import { InfrastructureFactory } from "../../../../builder/builders/InfrastructureFactory"; import type { Infrastructure } from "../../../../builder/types/ProjectTypes";
export class InfrastructureBuilder { build(input: Infrastructure): Infrastructure { return InfrastructureFactory.create(structuredClone(input)); } }
