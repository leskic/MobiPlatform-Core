import type { Project } from "../builder/types/ProjectTypes";
import type { Suggestion } from "./Suggestion";
import type { CopilotRule } from "./types/CopilotTypes";

export class RuleEngine {
  private readonly rules: readonly CopilotRule[];

  constructor(rules: readonly CopilotRule[] = []) {
    this.rules = [...rules];
  }

  analyze(project: Project): Suggestion[] {
    const snapshot = structuredClone(project);
    return this.rules.flatMap((rule) => structuredClone(rule.analyze(snapshot)));
  }
}
