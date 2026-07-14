import type { Project, ProjectInput } from "../types/ProjectTypes";

export class ProjectFactory {
  static create(input: ProjectInput): Project {
    return {
      ...structuredClone(input),
      schemaVersion: "1.0.0",
      measurementUnit: "mm",
      rotationUnit: "degrees",
      environments: []
    };
  }
}
