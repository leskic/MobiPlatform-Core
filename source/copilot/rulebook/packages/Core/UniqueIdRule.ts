import type { Project } from "../../../../builder/types/ProjectTypes";
import type { Rule } from "../../../rules/Rule";
import type { RuleResult } from "../../../rules/RuleResult";

interface IdentifiedPath { id: string; path: string }

function identified(project: Project): IdentifiedPath[] {
  const entities: IdentifiedPath[] = [{ id: project.id, path: "/id" }];
  project.environments.forEach((environment, environmentIndex) => {
    const base = `/environments/${environmentIndex}`;
    entities.push({ id: environment.id, path: `${base}/id` });
    environment.architectures.forEach((item, index) =>
      entities.push({ id: item.id, path: `${base}/architectures/${index}/id` })
    );
    environment.infrastructures.forEach((item, index) =>
      entities.push({ id: item.id, path: `${base}/infrastructures/${index}/id` })
    );
    environment.modules.forEach((module, moduleIndex) => {
      const moduleBase = `${base}/modules/${moduleIndex}`;
      entities.push({ id: module.id, path: `${moduleBase}/id` });
      module.parts.forEach((item, index) =>
        entities.push({ id: item.id, path: `${moduleBase}/parts/${index}/id` })
      );
      module.hardwares.forEach((item, index) =>
        entities.push({ id: item.id, path: `${moduleBase}/hardwares/${index}/id` })
      );
    });
  });
  return entities;
}

export class UniqueIdRule implements Rule {
  readonly id = "CORE_UNIQUE_ID";
  readonly displayName = "Unique IDs";
  readonly description = "Reports duplicated entity UUIDs across the project.";
  readonly severity = "error" as const;
  readonly enabled = true;

  analyze(context: Parameters<Rule["analyze"]>[0]): RuleResult[] {
    const seen = new Set<string>();
    const results: RuleResult[] = [];
    for (const entity of identified(context.getProject())) {
      if (seen.has(entity.id)) {
        results.push({
          code: this.id,
          severity: this.severity,
          path: entity.path,
          message: `Duplicate entity ID: ${entity.id}`
        });
      } else {
        seen.add(entity.id);
      }
    }
    return results;
  }
}
