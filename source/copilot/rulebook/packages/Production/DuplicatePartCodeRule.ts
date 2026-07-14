import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

type FuturePart = { code?: unknown };

export class DuplicatePartCodeRule implements Rule {
  readonly id = "PRODUCTION_DUPLICATE_PART_CODE";
  readonly displayName = "Duplicate part code";
  readonly description = "Prepared rule for repeated Part.code values when the field becomes supported.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const project = context.getProject();
    const allParts = project.environments.flatMap((environment) =>
      environment.modules.flatMap((module) => module.parts)
    ) as FuturePart[];
    const supportsCode = allParts.some((part) => Object.prototype.hasOwnProperty.call(part, "code"));
    if (!supportsCode) return [];

    const seen = new Set<string>();
    const results: RuleResult[] = [];
    project.environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        (module.parts as FuturePart[]).forEach((part, partIndex) => {
          if (typeof part.code !== "string" || part.code.trim().length === 0) return;
          if (seen.has(part.code)) {
            results.push({
              code: this.id,
              severity: this.severity,
              path: `/environments/${environmentIndex}/modules/${moduleIndex}/parts/${partIndex}/code`,
              message: `Duplicate part code: ${part.code}`
            });
          } else {
            seen.add(part.code);
          }
        });
      });
    });
    return results;
  }
}
