import { MobiOrigin } from "../origin/MobiOrigin";
import { MobiStudio } from "../studio/MobiStudio";
import { AnalysisResult } from "./AnalysisResult";
import { CopilotEngine } from "./CopilotEngine";
import { RuleEngine } from "./RuleEngine";
import type { Suggestion } from "./Suggestion";
import type { CopilotListener, CopilotRule, CopilotSessionSnapshot } from "./types/CopilotTypes";

export class MobiCopilot {
  private readonly engine: CopilotEngine;

  constructor(origin: MobiOrigin, studio: MobiStudio, rules: readonly CopilotRule[] = []) {
    this.engine = new CopilotEngine(origin, studio, new RuleEngine(rules));
  }

  createSession(id: string): CopilotSessionSnapshot { return this.engine.createSession(id); }
  startAnalysis(): void { this.engine.startAnalysis(); }
  stopAnalysis(): void { this.engine.stopAnalysis(); }
  analyzeProject(): AnalysisResult { return this.engine.analyzeProject(); }
  getSuggestions(): readonly Suggestion[] { return this.engine.getSuggestions(); }
  clearSuggestions(): void { this.engine.clearSuggestions(); }
  subscribe(listener: CopilotListener): void { this.engine.subscribe(listener); }
  unsubscribe(listener: CopilotListener): void { this.engine.unsubscribe(listener); }
}
