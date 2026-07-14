import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import type { Project } from "../../builder/types/ProjectTypes";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../builder/tests/fixture";
import { ProjectCodec } from "../../codec/ProjectCodec";
import { MobiOrigin } from "../MobiOrigin";
import { ProjectLifecycle } from "../ProjectLifecycle";
import { ProjectManager } from "../ProjectManager";
import { ProjectRepository } from "../ProjectRepository";
import { OriginError } from "../types/OriginError";

function completeProject(): Project {
  return new ProjectBuilder()
    .createProject(projectInput)
    .addEnvironment(environmentInput)
    .addArchitecture(ids.environment, architectureInput)
    .addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput)
    .build();
}

describe("MobiOrigin", () => {
  it("creates, validates and stores a new active project", () => {
    const repository = new ProjectRepository();
    const origin = new MobiOrigin(repository);
    const project = origin.newProject(projectInput);
    expect(project.id).toBe(ids.project);
    expect(project.environments).toEqual([]);
    expect(origin.hasProject()).toBe(true);
    expect(origin.validateProject()).toEqual({ valid: true, errors: [] });
    expect(repository.has(ids.project)).toBe(true);
  });

  it("opens valid JSON and replaces the active project", () => {
    const origin = new MobiOrigin();
    origin.newProject(projectInput);
    const replacement = completeProject();
    replacement.id = "223e4567-e89b-42d3-a456-426614174000";
    replacement.environments[0]!.parentId = replacement.id;
    const opened = origin.openProject(ProjectCodec.serialize(replacement));
    expect(opened.id).toBe(replacement.id);
    expect(origin.getProject()).toEqual(replacement);
  });

  it("saves and later loads the project from memory", () => {
    const repository = new ProjectRepository();
    const origin = new MobiOrigin(repository);
    const project = completeProject();
    origin.openProject(ProjectCodec.serialize(project));
    const saved = origin.saveProject();
    expect(JSON.parse(saved)).toEqual(project);
    origin.closeProject();
    expect(origin.hasProject()).toBe(false);
    expect(origin.loadProject(project.id)).toEqual(project);
  });

  it("closes and clears the active project", () => {
    const origin = new MobiOrigin();
    origin.newProject(projectInput);
    origin.closeProject();
    expect(origin.hasProject()).toBe(false);
    origin.newProject(projectInput);
    origin.clearProject();
    expect(origin.hasProject()).toBe(false);
  });

  it("rejects invalid input and invalid repository content", () => {
    const origin = new MobiOrigin();
    expect(() => origin.openProject("{invalid")).toThrowError(
      expect.objectContaining({ code: "INVALID_PROJECT" })
    );

    const repository = new ProjectRepository();
    repository.save(ids.project, JSON.stringify({ id: "invalid" }));
    const manager = new ProjectManager(repository, new ProjectLifecycle());
    expect(() => manager.loadProject(ids.project)).toThrowError(
      expect.objectContaining({ code: "INVALID_PROJECT" })
    );
  });

  it("reports nonexistent and absent projects", () => {
    const origin = new MobiOrigin();
    expect(() => origin.loadProject("missing")).toThrowError(
      expect.objectContaining({ code: "PROJECT_NOT_FOUND" })
    );
    expect(() => origin.getProject()).toThrowError(
      expect.objectContaining({ code: "NO_ACTIVE_PROJECT" })
    );
    expect(() => origin.saveProject()).toThrow(OriginError);
    expect(() => origin.validateProject()).toThrow(OriginError);
  });

  it("does not mutate inputs or expose active state", () => {
    const origin = new MobiOrigin();
    const project = completeProject();
    const before = structuredClone(project);
    const opened = origin.openProject(ProjectCodec.serialize(project));
    opened.environments.length = 0;
    const fetched = origin.getProject();
    fetched.environments[0]!.displayName = "Alterado";
    expect(origin.getProject()).toEqual(before);
    expect(project).toEqual(before);
  });
});
