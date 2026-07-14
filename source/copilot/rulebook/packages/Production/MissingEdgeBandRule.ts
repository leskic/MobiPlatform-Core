import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

const SIDES = ["top", "bottom", "left", "right", "front", "back"] as const;

function hasCompleteEdgeBand(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const edgeBanding = value as Record<string, unknown>;
  return SIDES.every((side) => {
    const edge = edgeBanding[side];
    return typeof edge === "object" && edge !== null
      && typeof (edge as Record<string, unknown>).applied === "boolean";
  });
}

export class MissingEdgeBandRule implements Rule {
  readonly id = "PRODUCTION_MISSING_EDGE_BAND";
  readonly displayName = "Missing edge band contract";
  readonly description = "Reports parts without complete edgeBanding sides required by the Schema.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const results: RuleResult[] = [];
    context.getProject().environments.forEach((environment, environmentIndex) => {
      environment.modules.forEach((module, moduleIndex) => {
        module.parts.forEach((part, partIndex) => {
          if (!hasCompleteEdgeBand(part.edgeBanding)) results.push({
            code: this.id,
            severity: this.severity,
            path: `/environments/${environmentIndex}/modules/${moduleIndex}/parts/${partIndex}/edgeBanding`,
            message: `Part does not contain the complete edgeBanding contract: ${part.id}`
          });
        });
      });
    });
    return results;
  }
}
