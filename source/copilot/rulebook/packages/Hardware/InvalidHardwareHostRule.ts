import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class InvalidHardwareHostRule implements Rule {
  readonly id = "HARDWARE_INVALID_HOST";
  readonly displayName = "Invalid hardware host";
  readonly description = "Reports a provided hostId that does not reference a part in the same module.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        const partIds = new Set(module.parts.map((part) => part.id));
        module.hardwares.forEach((hardware, hardwareIndex) => {
          if (hardware.hostId !== undefined && hardware.hostId !== null && !partIds.has(hardware.hostId)) {
            results.push({
              code: this.id,
              severity: this.severity,
              path: `/environments/${environmentIndex}/modules/${moduleIndex}/hardwares/${hardwareIndex}/hostId`,
              message: `Hardware hostId does not exist in the module: ${hardware.hostId}`
            });
          }
        });
      });
    });
    return results;
  }
}
