import type { Suggestion } from "./Suggestion";

export class AnalysisResult {
  readonly projectId: string;
  readonly suggestions: readonly Suggestion[];

  constructor(projectId: string, suggestions: readonly Suggestion[]) {
    this.projectId = projectId;
    this.suggestions = structuredClone(suggestions);
  }
}
