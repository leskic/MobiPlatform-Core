import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../ProjectBuilder";
import { BuilderValidationError } from "../types/BuilderValidationError";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "./fixture";

function completeBuilder(): ProjectBuilder {
  return new ProjectBuilder()
    .createProject(projectInput)
    .addEnvironment(environmentInput)
    .addArchitecture(ids.environment, architectureInput)
    .addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput);
}

describe("ProjectBuilder", () => {
  it("builds the complete official hierarchy and validates it", () => {
    const builder = completeBuilder();
    expect(builder.validate()).toEqual({ valid: true, errors: [] });
    const project = builder.build();
    expect(project.schemaVersion).toBe("1.0.0");
    expect(project.measurementUnit).toBe("mm");
    expect(project.rotationUnit).toBe("degrees");
    expect(project.environments[0]?.modules[0]?.parts[0]?.id).toBe(ids.part);
    expect(project.environments[0]?.modules[0]?.hardwares[0]?.id).toBe(ids.hardware);
    expect(project.environments[0]?.infrastructures[0]?.hostId).toBe(ids.architecture);
    expect(JSON.parse(builder.toJSON())).toEqual(project);
  });

  it("does not mutate inputs or expose internal mutable state", () => {
    const before = structuredClone(partInput);
    const builder = completeBuilder();
    const first = builder.build();
    first.environments.length = 0;
    expect(builder.build().environments).toHaveLength(1);
    expect(partInput).toEqual(before);
  });

  it("refuses to build or serialize an invalid project", () => {
    const builder = new ProjectBuilder().createProject({ ...projectInput, id: "invalid" });
    expect(builder.validate().valid).toBe(false);
    expect(() => builder.build()).toThrow(BuilderValidationError);
    expect(() => builder.toJSON()).toThrow(BuilderValidationError);
  });

  it("requires explicit hierarchy targets and project creation", () => {
    expect(() => new ProjectBuilder().build()).toThrow("Project has not been created");
    expect(() => new ProjectBuilder().addEnvironment(environmentInput)).toThrow("Project has not been created");
    const builder = new ProjectBuilder().createProject(projectInput);
    expect(() => builder.addModule("missing", moduleInput)).toThrow("Environment not found: missing");
    builder.addEnvironment(environmentInput);
    expect(() => builder.addPart("missing", partInput)).toThrow("Module not found: missing");
  });
});
