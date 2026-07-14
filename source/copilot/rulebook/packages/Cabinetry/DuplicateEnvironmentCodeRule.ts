import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class DuplicateEnvironmentCodeRule implements Rule {
  readonly id = "CABINETRY_DUPLICATE_ENVIRONMENT_CODE";
  readonly displayName = "Duplicate environment code";
  readonly description = "Reports environment codes repeated in the project.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const seen = new Set<string>();
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, index) => {
      if (seen.has(environment.code)) {
        results.push({
          code: this.id,
          severity: this.severity,
          path: `/environments/${index}/code`,
          message: `Duplicate environment code: ${environment.code}`
        });
      } else {
        seen.add(environment.code);
      }
    });
    return results;
  }
}
