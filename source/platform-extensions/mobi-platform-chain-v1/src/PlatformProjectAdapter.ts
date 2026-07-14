import { ProjectBuilder } from "../../../builder/ProjectBuilder";
import type { EnvironmentInput, ProjectInput } from "../../../builder/types/ProjectTypes";
import { ProjectParser } from "../../../codec/ProjectParser";
import { ProjectSerializer } from "../../../codec/ProjectSerializer";
import type {
  ConstructorProjectV1,
  MobiLevantamentoInputV1,
  ProjectMobiEnvelopeV1,
  ProjectMobiProducerPortV1,
  ProjectMobiReaderPortV1,
} from "./contracts";

export class PlatformProjectAdapter implements ProjectMobiProducerPortV1, ProjectMobiReaderPortV1 {
  produce(input: MobiLevantamentoInputV1): ProjectMobiEnvelopeV1 {
    this.validateInput(input);
    const projectInput: ProjectInput = {
      ...input.project,
      status: "draft",
    };
    const builder = new ProjectBuilder().createProject(projectInput);
    for (const environment of [...input.environments].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))) {
      const environmentInput: EnvironmentInput = {
        id: environment.id,
        parentId: input.project.id,
        displayName: environment.displayName,
        code: environment.code,
        order: environment.order,
        status: "draft",
      };
      builder.addEnvironment(environmentInput);
      for (const architecture of [...environment.architectures].sort((a, b) => a.id.localeCompare(b.id))) {
        builder.addArchitecture(environment.id, { ...structuredClone(architecture), parentId: environment.id });
      }
      for (const module of [...environment.modules].sort((a, b) => a.id.localeCompare(b.id))) {
        builder.addModule(environment.id, {
          id: module.id,
          parentId: environment.id,
          code: module.code,
          displayName: module.displayName,
          type: module.type,
          status: "draft",
          position: structuredClone(module.position),
          rotation: structuredClone(module.rotation),
        });
        for (const part of [...module.parts].sort((a, b) => a.id.localeCompare(b.id))) {
          builder.addPart(module.id, { ...structuredClone(part), parentId: module.id });
        }
      }
    }
    const payload = ProjectSerializer.serialize(builder.build());
    return {
      contract: "mobi.project-envelope",
      version: "1.0.0",
      schemaVersion: "1.0.0",
      projectId: input.project.id,
      mediaType: "application/vnd.mobi.project+json",
      payload,
      fingerprint: this.hash(payload),
    };
  }

  read(envelope: ProjectMobiEnvelopeV1): ConstructorProjectV1 {
    if (envelope.version !== "1.0.0" || envelope.schemaVersion !== "1.0.0" || envelope.mediaType !== "application/vnd.mobi.project+json") {
      throw new Error("UNSUPPORTED_PROJECT_ENVELOPE");
    }
    if (this.hash(envelope.payload) !== envelope.fingerprint) throw new Error("PROJECT_ENVELOPE_FINGERPRINT_MISMATCH");
    const result = ProjectParser.parse(envelope.payload);
    if (!result.success) throw new Error("INVALID_PROJECT_ENVELOPE");
    if (result.project.id !== envelope.projectId) throw new Error("PROJECT_ENVELOPE_ID_MISMATCH");
    return structuredClone(result.project) as ConstructorProjectV1;
  }

  private validateInput(input: MobiLevantamentoInputV1): void {
    if (input.contract !== "mobi.levantamento-input" || input.version !== "1.0.0" || !input.project.id.trim() || !input.environments.length) {
      throw new Error("INVALID_LEVANTAMENTO_INPUT");
    }
    const ids = new Set<string>([input.project.id]);
    for (const environment of input.environments) {
      if (!environment.id.trim() || ids.has(environment.id)) throw new Error("INVALID_LEVANTAMENTO_INPUT");
      ids.add(environment.id);
      for (const architecture of environment.architectures) {
        if (!architecture.id.trim() || ids.has(architecture.id)) throw new Error("INVALID_LEVANTAMENTO_INPUT");
        ids.add(architecture.id);
      }
      for (const module of environment.modules) {
        if (!module.id.trim() || ids.has(module.id)) throw new Error("INVALID_LEVANTAMENTO_INPUT");
        ids.add(module.id);
        for (const part of module.parts) {
          if (!part.id.trim() || ids.has(part.id)) throw new Error("INVALID_LEVANTAMENTO_INPUT");
          ids.add(part.id);
        }
      }
    }
  }

  private hash(raw: string): string {
    let hash = 2166136261;
    for (const char of raw) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }
}
