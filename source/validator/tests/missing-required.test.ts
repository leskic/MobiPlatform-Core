import { expect, it } from "vitest";
import { validate } from "../SchemaValidator";
import { validProject } from "./fixture";

it("maps a missing official PROJECT field without mutation", () => {
  const project = validProject();
  delete project.measurementUnit;
  const before = structuredClone(project);
  const result = validate(project);
  expect(result.valid).toBe(false);
  expect(result.errors[0]).toMatchObject({ code: "REQUIRED_FIELD", path: "/measurementUnit" });
  expect(project).toEqual(before);
});
