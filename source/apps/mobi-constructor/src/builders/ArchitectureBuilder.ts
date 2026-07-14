import { ArchitectureFactory } from "../../../../builder/builders/ArchitectureFactory"; import type { Architecture } from "../../../../builder/types/ProjectTypes";
export class ArchitectureBuilder { build(input: Architecture): Architecture { return ArchitectureFactory.create(structuredClone(input)); } }
