import type { RuleSeverity } from "./RuleSeverity";

export interface RuleResult {
  code: string;
  severity: RuleSeverity;
  path: string;
  message: string;
}
