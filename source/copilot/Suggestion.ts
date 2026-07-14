import type { SuggestionSeverity } from "./types/CopilotTypes";

export class Suggestion {
  constructor(
    readonly code: string,
    readonly severity: SuggestionSeverity,
    readonly path: string,
    readonly message: string
  ) {}
}
