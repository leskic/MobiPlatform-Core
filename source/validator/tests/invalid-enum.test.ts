import { expect, it } from "vitest";
import { validate } from "../SchemaValidator";
import { validProject } from "./fixture";

it("maps an invalid official Status enum without mutation", () => {
  const project = validProject();
  project.status = "approved";
  const before = structuredClone(project);
  const result = validate(project);
  expect(result.valid).toBe(false);
  expect(result.errors[0]).toMatchObject({ code: "INVALID_ENUM", path: "/status" });
  expect(project).toEqual(before);
});
