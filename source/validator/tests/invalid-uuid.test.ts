import { expect, it } from "vitest";
import { validate } from "../SchemaValidator";
import { validProject } from "./fixture";

it("maps an invalid official PROJECT UUID without mutation", () => {
  const project = validProject();
  project.id = "not-a-uuid";
  const before = structuredClone(project);
  const result = validate(project);
  expect(result.valid).toBe(false);
  expect(result.errors[0]).toMatchObject({ code: "INVALID_FORMAT", path: "/id" });
  expect(project).toEqual(before);
});

it("rejects an invalid Infrastructure hostId UUID without mutation", () => {
  const project = validProject();
  const environment = project.environments as Array<Record<string, unknown>>;
  const infrastructures = environment[0]!.infrastructures as Array<Record<string, unknown>>;
  infrastructures[0]!.hostId = "not-a-uuid";
  const before = structuredClone(project);
  const result = validate(project);
  expect(result.valid).toBe(false);
  expect(result.errors).toContainEqual(expect.objectContaining({
    code: "INVALID_FORMAT",
    path: "/environments/0/infrastructures/0/hostId"
  }));
  expect(project).toEqual(before);
});
