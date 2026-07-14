import type { Project, ProjectInput } from "../builder/types/ProjectTypes";
import type { ValidationResult } from "../validator/types/ValidationResult";
import { ProjectLifecycle } from "./ProjectLifecycle";
import { ProjectManager } from "./ProjectManager";
import { ProjectRepository } from "./ProjectRepository";

export class MobiOrigin {
  private readonly manager: ProjectManager;

  constructor(repository = new ProjectRepository()) {
    this.manager = new ProjectManager(repository, new ProjectLifecycle());
  }

  newProject(input: ProjectInput): Project { return this.manager.newProject(input); }
  openProject(input: string): Project { return this.manager.openProject(input); }
  closeProject(): void { this.manager.closeProject(); }
  saveProject(): string { return this.manager.saveProject(); }
  loadProject(id: string): Project { return this.manager.loadProject(id); }
  validateProject(): ValidationResult { return this.manager.validateProject(); }
  getProject(): Project { return this.manager.getProject(); }
  hasProject(): boolean { return this.manager.hasProject(); }
  clearProject(): void { this.manager.clearProject(); }
}
