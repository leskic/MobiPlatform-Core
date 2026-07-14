import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class DuplicateHardwareRule implements Rule {
  readonly id = "CABINETRY_DUPLICATE_HARDWARE";
  readonly displayName = "Duplicate hardware";
  readonly description = "Reports repeated hardware IDs within the same parent module.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        const seen = new Set<string>();
        module.hardwares.forEach((hardware, hardwareIndex) => {
          if (seen.has(hardware.id)) {
            results.push({
              code: this.id,
              severity: this.severity,
              path: `/environments/${environmentIndex}/modules/${moduleIndex}/hardwares/${hardwareIndex}/id`,
              message: `Duplicate hardware in module ${module.code}: ${hardware.id}`
            });
          } else {
            seen.add(hardware.id);
          }
        });
      });
    });
    return results;
  }
}
