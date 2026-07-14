import { ProjectBuilder } from "../builder/ProjectBuilder";
import type { Project, ProjectInput } from "../builder/types/ProjectTypes";
import { ProjectCodec } from "../codec/ProjectCodec";
import { validate } from "../validator/SchemaValidator";
import type { ValidationResult } from "../validator/types/ValidationResult";
import { ProjectLifecycle } from "./ProjectLifecycle";
import { ProjectRepository } from "./ProjectRepository";
import { OriginError } from "./types/OriginError";

export class ProjectManager {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly lifecycle: ProjectLifecycle
  ) {}

  newProject(input: ProjectInput): Project {
    const project = new ProjectBuilder().createProject(input).build();
    validate(project);
    const serialized = ProjectCodec.serialize(project);
    this.repository.save(project.id, serialized);
    const stored = this.parse(serialized);
    this.lifecycle.set(stored);
    return this.lifecycle.get();
  }

  openProject(input: string): Project {
    const project = this.parse(input);
    validate(project);
    this.lifecycle.set(project);
    return this.lifecycle.get();
  }

  closeProject(): void {
    this.lifecycle.clear();
  }

  saveProject(): string {
    const project = this.lifecycle.get();
    validate(project);
    const serialized = ProjectCodec.serialize(project);
    this.repository.save(project.id, serialized);
    return serialized;
  }

  loadProject(id: string): Project {
    const serialized = this.repository.load(id);
    const project = this.parse(serialized);
    this.lifecycle.set(project);
    return this.lifecycle.get();
  }

  validateProject(): ValidationResult {
    return validate(this.lifecycle.get());
  }

  getProject(): Project {
    return this.lifecycle.get();
  }

  hasProject(): boolean {
    return this.lifecycle.has();
  }

  clearProject(): void {
    this.lifecycle.clear();
  }

  private parse(input: string): Project {
    const result = ProjectCodec.parse(input);
    if (!result.success) throw new OriginError("INVALID_PROJECT", result.error.message);
    return result.project;
  }
}
