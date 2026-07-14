import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class InvalidHardwareCatalogRule implements Rule {
  readonly id = "HARDWARE_INVALID_CATALOG";
  readonly displayName = "Invalid hardware catalog ID";
  readonly description = "Reports hardware whose catalogId is empty.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        module.hardwares.forEach((hardware, hardwareIndex) => {
          if (hardware.catalogId.trim().length === 0) results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/hardwares/${hardwareIndex}/catalogId`,
            message: `Hardware has no valid catalogId: ${hardware.id}`
          });
        });
      });
    });
    return results;
  }
}
