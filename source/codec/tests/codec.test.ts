import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import type { Project } from "../../builder/types/ProjectTypes";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../builder/tests/fixture";
import { ProjectCodec } from "../ProjectCodec";
import { CodecError } from "../types/CodecError";

function validProject(): Project {
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

describe("ProjectCodec", () => {
  it("parses valid JSON through Validator and ProjectBuilder", () => {
    const project = validProject();
    const result = ProjectCodec.parse(JSON.stringify(project));
    expect(result.success).toBe(true);
    if (result.success) expect(result.project).toEqual(project);
    if (result.success) {
      expect(result.project.environments[0]?.infrastructures[0]?.hostId).toBe(ids.architecture);
    }
  });

  it("separates malformed JSON without exposing SyntaxError", () => {
    const result = ProjectCodec.parse("{invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CodecError);
      expect(result.error).not.toBeInstanceOf(SyntaxError);
      expect(result.error.code).toBe("JSON_SYNTAX_ERROR");
      expect(result.error.stack).not.toContain("JSON.parse");
    }
  });

  it("separates schema errors and keeps AJV internal structures private", () => {
    const result = ProjectCodec.parse(JSON.stringify({ id: "invalid" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("SCHEMA_ERROR");
      expect(result.error.validationErrors.length).toBeGreaterThan(0);
      expect(result.error.validationErrors[0]).toHaveProperty("code");
      expect(result.error.validationErrors[0]).not.toHaveProperty("keyword");
    }
  });

  it("serializes valid projects without mutation", () => {
    const project = validProject();
    const before = structuredClone(project);
    const serialized = ProjectCodec.serialize(project);
    expect(JSON.parse(serialized)).toEqual(project);
    expect(project).toEqual(before);
  });

  it("refuses schema-invalid projects before serialization", () => {
    expect(() => ProjectCodec.serialize({ id: "invalid" })).toThrowError(
      expect.objectContaining({ code: "SCHEMA_ERROR" })
    );
  });

  it("preserves all data through a complete round-trip", () => {
    const project = validProject();
    project.metadata = { revision: 3, flags: [true, false], nested: { value: null } };
    const result = ProjectCodec.parse(ProjectCodec.serialize(project));
    expect(result.success).toBe(true);
    if (result.success) expect(result.project).toEqual(project);
  });

  it("reports unsupported JSON values, non-finite numbers and cycles", () => {
    const unsupported = validProject();
    unsupported.metadata = { value: undefined };
    expect(() => ProjectCodec.serialize(unsupported)).toThrowError(
      expect.objectContaining({ code: "SERIALIZATION_ERROR" })
    );

    const nonFinite = validProject();
    nonFinite.metadata = { value: Number.NaN };
    expect(() => ProjectCodec.serialize(nonFinite)).toThrowError("non-finite number");

    const circular = validProject();
    const metadata: Record<string, unknown> = {};
    metadata.self = metadata;
    circular.metadata = metadata;
    expect(() => ProjectCodec.serialize(circular)).toThrowError("circular reference");

    const nonPlain = validProject();
    nonPlain.metadata = { value: new Date("2026-07-12T00:00:00Z") };
    expect(() => ProjectCodec.serialize(nonPlain)).toThrowError("non-plain object");
  });

  it("maps native stringify failures to CodecError", () => {
    const project = validProject();
    const metadata: Record<string, unknown> = {};
    Object.defineProperty(metadata, "toJSON", {
      enumerable: false,
      value: () => { throw new Error("internal failure"); }
    });
    project.metadata = metadata;
    expect(() => ProjectCodec.serialize(project)).toThrowError(
      expect.objectContaining({ code: "SERIALIZATION_ERROR", message: "Project could not be serialized" })
    );
  });
});
