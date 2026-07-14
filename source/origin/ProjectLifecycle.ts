import type { Project } from "../builder/types/ProjectTypes";
import { OriginError } from "./types/OriginError";

export class ProjectLifecycle {
  private activeProject: Project | undefined;

  set(project: Project): void {
    this.activeProject = structuredClone(project);
  }

  get(): Project {
    if (!this.activeProject) throw new OriginError("NO_ACTIVE_PROJECT", "No active project");
    return structuredClone(this.activeProject);
  }

  has(): boolean {
    return this.activeProject !== undefined;
  }

  clear(): void {
    this.activeProject = undefined;
  }
}
