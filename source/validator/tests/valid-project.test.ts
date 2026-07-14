import { describe, expect, it } from "vitest";
import { validate } from "../SchemaValidator";
import { validProject } from "./fixture";

describe("official Projeto.mobi v1.0.0", () => {
  it("accepts all seven official entities without mutation", () => {
    const project = validProject();
    const before = structuredClone(project);
    expect(validate(project)).toEqual({ valid: true, errors: [] });
    expect(project).toEqual(before);
  });

  it("accepts a null Infrastructure hostId", () => {
    const project = validProject();
    const environments = project.environments as Array<Record<string, unknown>>;
    const infrastructures = environments[0]!.infrastructures as Array<Record<string, unknown>>;
    infrastructures[0]!.hostId = null;
    expect(validate(project)).toEqual({ valid: true, errors: [] });
  });
});
