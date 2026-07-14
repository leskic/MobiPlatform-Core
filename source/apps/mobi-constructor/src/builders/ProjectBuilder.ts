import { ProjectFactory } from "../../../../builder/builders/ProjectFactory"; import type { Project, ProjectInput } from "../../../../builder/types/ProjectTypes";
export class ProjectBuilder { build(input: ProjectInput): Project { return ProjectFactory.create(structuredClone(input)); } }
