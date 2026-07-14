import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

export class ParentReferenceRule implements Rule {
  readonly id = "CORE_PARENT_REFERENCE";
  readonly displayName = "Parent references";
  readonly description = "Reports entities whose parentId does not match their hierarchy parent.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const project = context.getProject();
    const results: RuleResult[] = [];
    const check = (parentId: string, expected: string, path: string) => {
      if (parentId !== expected) results.push({
        code: this.id,
        severity: this.severity,
        path,
        message: `Invalid parentId: expected ${expected}`
      });
    };

    project.environments.forEach((environment, environmentIndex) => {
      const base = `/environments/${environmentIndex}`;
      check(environment.parentId, project.id, `${base}/parentId`);
      environment.architectures.forEach((item, index) =>
        check(item.parentId, environment.id, `${base}/architectures/${index}/parentId`)
      );
      environment.infrastructures.forEach((item, index) =>
        check(item.parentId, environment.id, `${base}/infrastructures/${index}/parentId`)
      );
      environment.modules.forEach((module, moduleIndex) => {
        const moduleBase = `${base}/modules/${moduleIndex}`;
        check(module.parentId, environment.id, `${moduleBase}/parentId`);
        module.parts.forEach((item, index) =>
          check(item.parentId, module.id, `${moduleBase}/parts/${index}/parentId`)
        );
        module.hardwares.forEach((item, index) =>
          check(item.parentId, module.id, `${moduleBase}/hardwares/${index}/parentId`)
        );
      });
    });
    return results;
  }
}
