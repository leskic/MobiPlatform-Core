import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

const ALLOWED = new Set(["lengthwise", "crosswise", "none"]);

export class InvalidGrainDirectionRule implements Rule {
  readonly id = "PRODUCTION_INVALID_GRAIN_DIRECTION";
  readonly displayName = "Invalid grain direction";
  readonly description = "Reports grainDirection outside the official enum.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        module.parts.forEach((part, partIndex) => {
          if (!ALLOWED.has(part.grainDirection)) results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/parts/${partIndex}/grainDirection`,
            message: `Invalid grainDirection: ${part.grainDirection}`
          });
        });
      });
    });
    return results;
  }
}
