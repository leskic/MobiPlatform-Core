import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class MissingMaterialRule implements Rule {
  readonly id = "CABINETRY_MISSING_MATERIAL";
  readonly displayName = "Missing material";
  readonly description = "Reports parts whose materialId is empty.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        module.parts.forEach((part, partIndex) => {
          if (part.materialId.trim().length === 0) results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/parts/${partIndex}/materialId`,
            message: `Part has no valid materialId: ${part.id}`
          });
        });
      });
    });
    return results;
  }
}
