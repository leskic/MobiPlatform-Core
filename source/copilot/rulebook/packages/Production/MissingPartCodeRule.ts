import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

type FuturePart = { id: string; code?: unknown };

export class MissingPartCodeRule implements Rule {
  readonly id = "PRODUCTION_MISSING_PART_CODE";
  readonly displayName = "Missing part code";
  readonly description = "Prepared rule for parts without code when Part.code becomes supported.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const project = context.getProject();
    const parts = project.environments.flatMap((environment) =>
      environment.modules.flatMap((module) => module.parts)
    ) as FuturePart[];
    const supportsCode = parts.some((part) => Object.prototype.hasOwnProperty.call(part, "code"));
    if (!supportsCode) return [];

    const results: RuleResult[] = [];
    project.environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        (module.parts as FuturePart[]).forEach((part, partIndex) => {
          if (typeof part.code !== "string" || part.code.trim().length === 0) results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/parts/${partIndex}/code`,
            message: `Part has no production code: ${part.id}`
          });
        });
      });
    });
    return results;
  }
}
