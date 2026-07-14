import type { Rule } from "../../../copilot/rules/Rule";
import type { RuleContext } from "../../../copilot/rules/RuleContext";
import type { RuleResult } from "../../../copilot/rules/RuleResult";
import { OpeningValidator } from "./OpeningValidator";

export class OpeningRule implements Rule {
  readonly id = "products.openings.topology"; readonly displayName = "Opening topology"; readonly description = "Validates opening hosts, bounds and overlap"; readonly severity = "error" as const; readonly enabled = true;
  constructor(private readonly validator = new OpeningValidator()) {}
  analyze(context: RuleContext): RuleResult[] { return context.getProject().environments.flatMap(environment => this.validator.validateEnvironment(environment).issues.map(issue => ({ code: issue.code, severity: "error" as const, path: issue.path, message: `${issue.code}: ${issue.openingIds.join(",")}` }))); }
}
