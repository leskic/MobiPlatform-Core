import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class ProjectIntegrityRule implements Rule {
  readonly id = "CORE_PROJECT_INTEGRITY";
  readonly displayName = "Project references";
  readonly description = "Reports hostId references outside their structural scope.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      const base = `/environments/${environmentIndex}`;
      const architectureIds = new Set(environment.architectures.map((item) => item.id));
      environment.architectures.forEach((item, index) => {
        if (item.hostId !== undefined && item.hostId !== null && !architectureIds.has(item.hostId)) {
          results.push({
            code: this.id,
            severity: this.severity,
            path: `${base}/architectures/${index}/hostId`,
            message: `Invalid architecture hostId: ${item.hostId}`
          });
        }
      });
      environment.infrastructures.forEach((item, index) => {
        if (item.hostId !== undefined && item.hostId !== null && !architectureIds.has(item.hostId)) {
          results.push({
            code: this.id,
            severity: this.severity,
            path: `${base}/infrastructures/${index}/hostId`,
            message: `Invalid infrastructure hostId: ${item.hostId}`
          });
        }
      });
      environment.modules.forEach((module, moduleIndex) => {
        const partIds = new Set(module.parts.map((item) => item.id));
        module.hardwares.forEach((item, index) => {
          if (item.hostId !== undefined && item.hostId !== null && !partIds.has(item.hostId)) {
            results.push({
              code: this.id,
              severity: this.severity,
              path: `${base}/modules/${moduleIndex}/hardwares/${index}/hostId`,
              message: `Invalid hardware hostId: ${item.hostId}`
            });
          }
        });
      });
    });
    return results;
  }
}
