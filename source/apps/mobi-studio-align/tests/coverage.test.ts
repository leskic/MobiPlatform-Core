import { describe, expect, it } from "vitest";
import { AlignController, type AlignAxis, type AlignMode } from "../src/AlignController";
import { ids, secondPartId, setup } from "./TestHarness";

const cases: Array<[AlignAxis, AlignMode]> = [
  ["x", "minimum"], ["x", "center"], ["x", "maximum"],
  ["y", "minimum"], ["y", "center"], ["y", "maximum"],
  ["z", "minimum"], ["z", "center"], ["z", "maximum"]
];

describe("Align axes and modes", () => {
  it.each(cases)("aligns %s using %s", (axis, mode) => {
    const x = setup();
    if (axis === "x") {
      const project = x.foundation.getProject();
      project.environments[0]!.modules[0]!.parts[1]!.position.y = 2000;
      x.foundation.openProject(JSON.stringify(project));
    }
    expect(new AlignController(x.spatial).align([ids.part, secondPartId], axis, mode, "a", 5).success).toBe(true);
  });
});
