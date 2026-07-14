import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class DuplicateModuleCodeRule implements Rule {
  readonly id = "CABINETRY_DUPLICATE_MODULE_CODE";
  readonly displayName = "Duplicate module code";
  readonly description = "Reports module codes repeated anywhere in the project.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const seen = new Set<string>();
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        if (seen.has(module.code)) {
          results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/code`,
            message: `Duplicate module code: ${module.code}`
          });
        } else {
          seen.add(module.code);
        }
      });
    });
    return results;
  }
}
