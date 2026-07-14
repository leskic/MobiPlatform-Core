import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

function hasValidPosition(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const position = value as Record<string, unknown>;
  return typeof position.x === "number" && Number.isFinite(position.x)
    && typeof position.y === "number" && Number.isFinite(position.y)
    && typeof position.z === "number" && Number.isFinite(position.z);
}

export class MissingHardwarePositionRule implements Rule {
  readonly id = "HARDWARE_MISSING_POSITION";
  readonly displayName = "Missing hardware position";
  readonly description = "Reports hardware without finite x, y and z position values.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        module.hardwares.forEach((hardware, hardwareIndex) => {
          if (!hasValidPosition(hardware.position)) results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/hardwares/${hardwareIndex}/position`,
            message: `Hardware has no valid position: ${hardware.id}`
          });
        });
      });
    });
    return results;
  }
}
