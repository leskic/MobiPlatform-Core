import { OriginError } from "./types/OriginError";

export class ProjectRepository {
  private readonly projects = new Map<string, string>();

  save(id: string, serializedProject: string): void {
    this.projects.set(id, serializedProject);
  }

  load(id: string): string {
    const project = this.projects.get(id);
    if (project === undefined) throw new OriginError("PROJECT_NOT_FOUND", `Project not found: ${id}`);
    return project;
  }

  has(id: string): boolean {
    return this.projects.has(id);
  }
}
