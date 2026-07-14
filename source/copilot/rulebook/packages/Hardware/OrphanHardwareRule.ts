import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class OrphanHardwareRule implements Rule {
  readonly id = "HARDWARE_ORPHAN";
  readonly displayName = "Orphan hardware";
  readonly description = "Reports hardware whose parentId is not its containing module.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        module.hardwares.forEach((hardware, hardwareIndex) => {
          if (hardware.parentId !== module.id) results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/hardwares/${hardwareIndex}/parentId`,
            message: `Hardware parentId does not reference its module: ${hardware.parentId}`
          });
        });
      });
    });
    return results;
  }
}
