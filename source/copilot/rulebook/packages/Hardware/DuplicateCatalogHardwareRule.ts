import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class DuplicateCatalogHardwareRule implements Rule {
  readonly id = "HARDWARE_DUPLICATE_CATALOG_ON_HOST";
  readonly displayName = "Duplicate catalog hardware on host";
  readonly description = "Reports the same catalogId repeated for the same host in one module.";
  readonly severity = "warning" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        const seen = new Set<string>();
        module.hardwares.forEach((hardware, hardwareIndex) => {
          const key = `${hardware.hostId ?? "<no-host>"}\u0000${hardware.catalogId}`;
          if (seen.has(key)) {
            results.push({
              code: this.id,
              severity: this.severity,
              path: `/environments/${environmentIndex}/modules/${moduleIndex}/hardwares/${hardwareIndex}/catalogId`,
              message: `Catalog hardware repeated on the same host: ${hardware.catalogId}`
            });
          } else {
            seen.add(key);
          }
        });
      });
    });
    return results;
  }
}
