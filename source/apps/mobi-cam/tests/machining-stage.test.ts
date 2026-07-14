import { describe, expect, it } from "vitest";
import { MACHINING_STAGES } from "../src/MachiningStage";

describe("MachiningStage", () => {
  it("exposes the deterministic lifecycle", () => {
    expect(MACHINING_STAGES).toEqual(["PLANNED", "VALIDATED", "PACKAGED"]);
  });
});
