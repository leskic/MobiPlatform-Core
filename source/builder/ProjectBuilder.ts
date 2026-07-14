import { validate as validateSchema } from "../validator/SchemaValidator";
import type { ValidationResult } from "../validator/types/ValidationResult";
import { ArchitectureFactory } from "./builders/ArchitectureFactory";
import { EnvironmentFactory } from "./builders/EnvironmentFactory";
import { HardwareFactory } from "./builders/HardwareFactory";
import { InfrastructureFactory } from "./builders/InfrastructureFactory";
import { ModuleFactory } from "./builders/ModuleFactory";
import { PartFactory } from "./builders/PartFactory";
import { ProjectFactory } from "./builders/ProjectFactory";
import { BuilderValidationError } from "./types/BuilderValidationError";
import type {
  Architecture, EnvironmentInput, Hardware, Infrastructure, ModuleInput,
  Part, Project, ProjectInput
} from "./types/ProjectTypes";

export class ProjectBuilder {
  private project: Project | undefined;

  createProject(input: ProjectInput): this {
    this.project = ProjectFactory.create(input);
    return this;
  }

  addEnvironment(input: EnvironmentInput): this {
    this.requireProject().environments.push(EnvironmentFactory.create(input));
    return this;
  }

  addArchitecture(environmentId: string, input: Architecture): this {
    this.environment(environmentId).architectures.push(ArchitectureFactory.create(input));
    return this;
  }

  addInfrastructure(environmentId: string, input: Infrastructure): this {
    this.environment(environmentId).infrastructures.push(InfrastructureFactory.create(input));
    return this;
  }

  addModule(environmentId: string, input: ModuleInput): this {
    this.environment(environmentId).modules.push(ModuleFactory.create(input));
    return this;
  }

  addPart(moduleId: string, input: Part): this {
    this.module(moduleId).parts.push(PartFactory.create(input));
    return this;
  }

  addHardware(moduleId: string, input: Hardware): this {
    this.module(moduleId).hardwares.push(HardwareFactory.create(input));
    return this;
  }

  validate(): ValidationResult {
    return validateSchema(this.project);
  }

  build(): Project {
    const project = this.requireProject();
    const result = validateSchema(project);
    if (!result.valid) throw new BuilderValidationError(result);
    return structuredClone(project);
  }

  toJSON(): string {
    return JSON.stringify(this.build());
  }

  private requireProject(): Project {
    if (!this.project) throw new Error("Project has not been created");
    return this.project;
  }

  private environment(id: string) {
    const environment = this.requireProject().environments.find((item) => item.id === id);
    if (!environment) throw new Error(`Environment not found: ${id}`);
    return environment;
  }

  private module(id: string) {
    for (const environment of this.requireProject().environments) {
      const module = environment.modules.find((item) => item.id === id);
      if (module) return module;
    }
    throw new Error(`Module not found: ${id}`);
  }
}
