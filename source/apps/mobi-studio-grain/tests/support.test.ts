import { describe, expect, it } from "vitest";
import type { Rule } from "../../../copilot/rules/Rule";
import { IntentEditController } from "../../mobi-studio-intent-edit/src/IntentEditController";
import * as api from "../src/index";
import { ids, setup } from "./TestHarness";

const reject: Rule = { id: "REJECT_GRAIN", displayName: "reject", description: "reject", severity: "error", enabled: true, analyze: () => [{ code: "REJECT_GRAIN", severity: "error", path: "/", message: "reject" }] };

describe("Grain application contracts", () => {
  it("exports the public controller and rejects RuleRunner errors", () => {
    expect(api.GrainController).toBeDefined(); const x = setup([reject]);
    expect(new api.GrainController(x.app, x.presentation, x.runner).update(ids.part, "crosswise", "a", 1).code).toBe("RULE_VALIDATION_FAILED");
  });
  it("rejects unknown Parts", () => {
    const x = setup([]); expect(() => new api.GrainController(x.app, x.presentation, x.runner).update("missing", "none", "a", 1)).toThrow("ENTITY_NOT_PART");
  });
  it("propagates concurrency from the frozen Intent-Edit Extension", () => {
    const x = setup([]); const tool = new api.GrainController(x.app, x.presentation, x.runner);
    const internal = (tool as unknown as { intent: IntentEditController }).intent;
    x.presentation.repository.selection.select(ids.part); expect(internal.initiateEdit("a", 1).success).toBe(true);
    expect(tool.update(ids.part, "none", "a", 2).code).toBe("EDIT_ALREADY_ACTIVE");
    internal.rollback();
  });
  it("returns failed undo when the frozen Intent-Edit session is busy", () => {
    const x = setup([]); const tool = new api.GrainController(x.app, x.presentation, x.runner); tool.update(ids.part, "crosswise", "a", 1);
    const internal = (tool as unknown as { intent: IntentEditController }).intent;
    x.presentation.repository.selection.select(ids.part); internal.initiateEdit("a", 3);
    expect(tool.undo().success).toBe(false); internal.rollback();
  });
});
