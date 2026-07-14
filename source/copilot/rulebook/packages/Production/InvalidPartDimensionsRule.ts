import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class InvalidPartDimensionsRule implements Rule {
  readonly id = "PRODUCTION_INVALID_PART_DIMENSIONS";
  readonly displayName = "Invalid part dimensions";
  readonly description = "Reports non-positive or non-finite part dimensions.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        module.parts.forEach((part, partIndex) => {
          const dimensions = [
            ["width", part.size.width],
            ["height", part.size.height],
            ["thickness", part.size.thickness]
          ] as const;
          dimensions.forEach(([name, value]) => {
            if (!Number.isFinite(value) || value <= 0) results.push({
              code: this.id,
              severity: this.severity,
              path: `/environments/${environmentIndex}/modules/${moduleIndex}/parts/${partIndex}/size/${name}`,
              message: `Part ${name} must be greater than zero: ${part.id}`
            });
          });
        });
      });
    });
    return results;
  }
}
