import type { Project } from "../../builder/types/ProjectTypes";
import type { AnalysisResult } from "../AnalysisResult";
import type { Suggestion } from "../Suggestion";

export type SuggestionSeverity = "info" | "warning" | "error";

export interface CopilotRule {
  readonly code: string;
  analyze(project: Readonly<Project>): readonly Suggestion[];
}

export type CopilotEventType =
  | "analysis-started"
  | "analysis-stopped"
  | "analysis-completed"
  | "suggestions-cleared";

export interface CopilotEvent {
  type: CopilotEventType;
  result?: AnalysisResult;
}

export type CopilotListener = (event: CopilotEvent) => void;

export interface CopilotSessionSnapshot {
  id: string;
  active: boolean;
  analyzing: boolean;
}
