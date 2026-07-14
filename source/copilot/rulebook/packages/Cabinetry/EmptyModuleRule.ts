import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class EmptyModuleRule implements Rule {
  readonly id = "CABINETRY_EMPTY_MODULE";
  readonly displayName = "Empty module";
  readonly description = "Reports modules without parts.";
  readonly severity = "warning" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        if (module.parts.length === 0) results.push({
          code: this.id,
          severity: this.severity,
          path: `/environments/${environmentIndex}/modules/${moduleIndex}/parts`,
          message: `Module has no parts: ${module.code}`
        });
      });
    });
    return results;
  }
}
