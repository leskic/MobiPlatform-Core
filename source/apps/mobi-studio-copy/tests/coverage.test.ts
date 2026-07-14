import { describe, expect, it } from "vitest";
import { CopyController } from "../src/CopyController";
import { PartCollisionPolicy } from "../src/SpatialTransaction";
import { ids, setup } from "./TestHarness";

describe("Copy descriptor coverage", () => {
  it("copies multiple entities deterministically", () => {
    const x = setup(); const tool = new CopyController(x.spatial);
    const result = tool.copy([
      { sourceId: ids.part, newId: "00000000-0000-4000-8000-000000000061", offset: { x: 0, y: 2000, z: 0 } },
      { sourceId: ids.part, newId: "00000000-0000-4000-8000-000000000062", offset: { x: 0, y: 4000, z: 0 } }
    ], "a", 3);
    expect(result.success).toBe(true);
  });
  it("rejects malformed and missing sources", () => {
    const x = setup(); const tool = new CopyController(x.spatial);
    expect(() => tool.copy([{ sourceId: ids.part, newId: " ", offset: { x: 1, y: 1, z: 1 } }], "a", 1)).toThrow("INVALID_COPY");
    expect(() => tool.copy([{ sourceId: ids.part, newId: "00000000-0000-4000-8000-000000000063", offset: { x: NaN, y: 1, z: 1 } }], "a", 1)).toThrow("INVALID_COPY");
    expect(tool.copy([{ sourceId: "missing", newId: "00000000-0000-4000-8000-000000000064", offset: { x: 1, y: 1, z: 1 } }], "a", 1).code).toBe("ROLLED_BACK");
  });
  it("evaluates non-collision separation on every spatial axis", () => {
    const x = setup(); const policy = new PartCollisionPolicy();
    const separatedY = x.foundation.getProject(); separatedY.environments[0]!.modules[0]!.parts[1]!.position = { x: 0, y: 2000, z: 0 };
    expect(() => policy.validate(separatedY, [ids.part])).not.toThrow();
    const separatedZ = x.foundation.getProject(); separatedZ.environments[0]!.modules[0]!.parts[1]!.position = { x: 0, y: 0, z: 2000 };
    expect(() => policy.validate(separatedZ, [ids.part])).not.toThrow();
  });
});
