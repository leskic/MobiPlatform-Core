import type { Rule } from "../../../rules/Rule";

export class EmptyProjectRule implements Rule {
  readonly id = "CORE_EMPTY_PROJECT";
  readonly displayName = "Empty project";
  readonly description = "Reports a project without environments.";
  readonly severity = "warning" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]) {
    return context.getProject().environments.length === 0
      ? [{
          code: this.id,
          severity: this.severity,
          path: "/environments",
          message: "Project has no environments"
        }]
      : [];
  }
}
