import { ProjectBuilder } from "../builder/ProjectBuilder";
import type {
  EnvironmentInput, ModuleInput, Project, ProjectInput
} from "../builder/types/ProjectTypes";
import { validate } from "../validator/SchemaValidator";
import { CodecError } from "./types/CodecError";
import type { ParseResult } from "./types/ParseResult";

export class ProjectParser {
  static parse(input: string): ParseResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(input) as unknown;
    } catch {
      return {
        success: false,
        error: new CodecError("JSON_SYNTAX_ERROR", "Input is not valid JSON")
      };
    }

    const validation = validate(parsed);
    if (!validation.valid) {
      return {
        success: false,
        error: new CodecError("SCHEMA_ERROR", "JSON does not match Projeto.mobi schema", validation.errors)
      };
    }

    const project = parsed as Project;
    const {
      schemaVersion: _schemaVersion,
      measurementUnit: _measurementUnit,
      rotationUnit: _rotationUnit,
      environments,
      ...projectInput
    } = project;
    const builder = new ProjectBuilder().createProject(projectInput as ProjectInput);

    for (const environment of environments) {
      const { architectures, infrastructures, modules, ...environmentInput } = environment;
      builder.addEnvironment(environmentInput as EnvironmentInput);
      for (const architecture of architectures) builder.addArchitecture(environment.id, architecture);
      for (const infrastructure of infrastructures) builder.addInfrastructure(environment.id, infrastructure);
      for (const module of modules) {
        const { parts, hardwares, ...moduleInput } = module;
        builder.addModule(environment.id, moduleInput as ModuleInput);
        for (const part of parts) builder.addPart(module.id, part);
        for (const hardware of hardwares) builder.addHardware(module.id, hardware);
      }
    }

    return { success: true, project: builder.build() };
  }
}
