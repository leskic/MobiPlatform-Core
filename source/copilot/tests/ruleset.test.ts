import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import type { Project } from "../../builder/types/ProjectTypes";
import {
  environmentInput, ids, projectInput
} from "../../builder/tests/fixture";
import { ProjectCodec } from "../../codec/ProjectCodec";
import { MobiOrigin } from "../../origin/MobiOrigin";
import { MobiStudio } from "../../studio/MobiStudio";
import { MobiCopilot } from "../MobiCopilot";
import type { Rule } from "../rules/Rule";
import { RuleContext } from "../rules/RuleContext";
import { RuleRegistry } from "../rules/RuleRegistry";
import { RuleRunner } from "../rules/RuleRunner";

function project(): Project {
  return new ProjectBuilder().createProject(projectInput).addEnvironment(environmentInput).build();
}

function fakeRule(id: string, enabled = true): Rule {
  return {
    id,
    displayName: `Rule ${id}`,
    description: `Test rule ${id}`,
    severity: "info",
    enabled,
    analyze(context) {
      return [{ code: id, severity: "info", path: "/id", message: context.getProject().id }];
    }
  };
}

describe("Official RuleSet infrastructure", () => {
  it("registers and lists rules in deterministic insertion order", () => {
    const registry = new RuleRegistry();
    registry.registerRule(fakeRule("RULE_B"));
    registry.registerRule(fakeRule("RULE_A", false));
    expect(registry.listRules().map((rule) => [rule.id, rule.enabled])).toEqual([
      ["RULE_B", true], ["RULE_A", false]
    ]);
    expect(() => registry.registerRule(fakeRule("RULE_B"))).toThrow("Rule already registered: RULE_B");
  });

  it("unregisters rules without changing remaining order", () => {
    const registry = new RuleRegistry();
    registry.registerRule(fakeRule("ONE"));
    registry.registerRule(fakeRule("TWO"));
    registry.registerRule(fakeRule("THREE"));
    expect(registry.unregisterRule("TWO")).toBe(true);
    expect(registry.unregisterRule("missing")).toBe(false);
    expect(registry.listRules().map((rule) => rule.id)).toEqual(["ONE", "THREE"]);
  });

  it("enables and disables rules independently of their definitions", () => {
    const registry = new RuleRegistry();
    const definition = fakeRule("RULE", false);
    registry.registerRule(definition);
    registry.enableRule("RULE");
    expect(registry.listRules()[0]?.enabled).toBe(true);
    expect(definition.enabled).toBe(false);
    registry.disableRule("RULE");
    expect(registry.listRules()[0]?.enabled).toBe(false);
    expect(() => registry.enableRule("missing")).toThrow("Rule not found: missing");
    expect(() => registry.disableRule("missing")).toThrow("Rule not found: missing");
  });

  it("runs one enabled rule and skips a disabled rule", () => {
    const registry = new RuleRegistry();
    registry.registerRule(fakeRule("ENABLED"));
    registry.registerRule(fakeRule("DISABLED", false));
    const runner = new RuleRunner(registry);
    const context = new RuleContext(project());
    expect(runner.runRule("ENABLED", context)[0]?.code).toBe("ENABLED");
    expect(runner.runRule("DISABLED", context)).toEqual([]);
    expect(() => runner.runRule("missing", context)).toThrow("Rule not found: missing");
  });

  it("runs all enabled rules in registry order", () => {
    const registry = new RuleRegistry();
    registry.registerRule(fakeRule("FIRST"));
    registry.registerRule(fakeRule("SKIPPED", false));
    registry.registerRule(fakeRule("LAST"));
    const results = new RuleRunner(registry).runAll(new RuleContext(project()));
    expect(results.map((result) => result.code)).toEqual(["FIRST", "LAST"]);
    expect(registry.getEnabledRules().map((rule) => rule.id)).toEqual(["FIRST", "LAST"]);
    expect(registry.getRule("missing")).toBeUndefined();
  });

  it("isolates the project between rules and from Origin", () => {
    const original = project();
    const mutator: Rule = {
      ...fakeRule("MUTATOR"),
      analyze(context) {
        context.getProject().displayName = "local copy";
        const snapshot = context.getProject();
        snapshot.displayName = "mutated again";
        return [];
      }
    };
    const observer: Rule = {
      ...fakeRule("OBSERVER"),
      analyze(context) {
        return [{
          code: "OBSERVED", severity: "info", path: "/displayName",
          message: context.getProject().displayName
        }];
      }
    };
    const registry = new RuleRegistry();
    registry.registerRule(mutator);
    registry.registerRule(observer);
    const results = new RuleRunner(registry).runAll(new RuleContext(original));
    expect(results[0]?.message).toBe(original.displayName);
    expect(original.displayName).toBe(projectInput.displayName);
  });

  it("adapts RuleResults to Copilot Suggestions", () => {
    const registry = new RuleRegistry();
    registry.registerRule(fakeRule("RULESET_RESULT"));
    const runner = new RuleRunner(registry);
    const origin = new MobiOrigin();
    const studio = new MobiStudio(origin);
    const copilot = new MobiCopilot(origin, studio, [runner]);
    studio.createSession("studio-session");
    copilot.createSession("copilot-session");
    copilot.startAnalysis();
    studio.openProject(ProjectCodec.serialize(project()));
    expect(copilot.getSuggestions()).toEqual([
      expect.objectContaining({ code: "RULESET_RESULT", severity: "info", path: "/id" })
    ]);
  });

  it("returns isolated result and descriptor arrays", () => {
    const registry = new RuleRegistry();
    registry.registerRule(fakeRule("ISOLATED"));
    const listed = registry.listRules().map((rule) => ({ ...rule }));
    listed[0]!.id = "changed";
    expect(registry.listRules()[0]?.id).toBe("ISOLATED");
    const results = new RuleRunner(registry).runAll(new RuleContext(project())).map((result) => ({ ...result }));
    results[0]!.code = "changed";
    expect(new RuleRunner(registry).runAll(new RuleContext(project()))[0]?.code).toBe("ISOLATED");
  });
});
