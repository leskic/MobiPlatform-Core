import type { Project } from "../../builder/types/ProjectTypes";

export class RuleContext {
  private readonly project: Project;

  constructor(project: Project) {
    this.project = structuredClone(project);
  }

  getProject(): Project {
    return structuredClone(this.project);
  }
}
