import type { RuleSeverity } from "../rules/RuleSeverity";

export interface RuleDescriptor {
  packageId: string;
  id: string;
  displayName: string;
  description: string;
  severity: RuleSeverity;
  enabled: boolean;
  loaded: boolean;
}

export interface RulePackageDescriptor {
  id: string;
  displayName: string;
  description: string;
  categoryId: string;
  version: string;
  loaded: boolean;
  ruleCount: number;
}
