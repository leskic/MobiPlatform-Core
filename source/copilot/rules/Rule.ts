import type { RuleContext } from "./RuleContext";
import type { RuleResult } from "./RuleResult";
import type { RuleSeverity } from "./RuleSeverity";

export interface Rule {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly severity: RuleSeverity;
  readonly enabled: boolean;
  analyze(context: RuleContext): readonly RuleResult[];
}

export interface RuleDescriptor {
  id: string;
  displayName: string;
  description: string;
  severity: RuleSeverity;
  enabled: boolean;
}
