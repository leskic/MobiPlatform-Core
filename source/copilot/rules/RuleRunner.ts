import type { Project } from "../../builder/types/ProjectTypes";
import { Suggestion } from "../Suggestion";
import type { CopilotRule } from "../types/CopilotTypes";
import { RuleContext } from "./RuleContext";
import type { RuleResult } from "./RuleResult";
import { RuleRegistry } from "./RuleRegistry";

export class RuleRunner implements CopilotRule {
  readonly code = "OFFICIAL_RULESET_V1";

  constructor(private readonly registry: RuleRegistry) {}

  runRule(id: string, context: RuleContext): readonly RuleResult[] {
    const rule = this.registry.getRule(id);
    if (!rule) throw new Error(`Rule not found: ${id}`);
    if (!this.registry.isEnabled(id)) return [];
    return structuredClone(rule.analyze(new RuleContext(context.getProject())));
  }

  runAll(context: RuleContext): readonly RuleResult[] {
    return this.registry.getEnabledRules().flatMap((rule) =>
      structuredClone(rule.analyze(new RuleContext(context.getProject())))
    );
  }

  analyze(project: Readonly<Project>): readonly Suggestion[] {
    return this.runAll(new RuleContext(structuredClone(project))).map((result) =>
      new Suggestion(result.code, result.severity, result.path, result.message)
    );
  }
}
