import { MobiOrigin } from "../origin/MobiOrigin";
import type { MobiStudio } from "../studio/MobiStudio";
import type { StudioEvent, StudioListener } from "../studio/types/StudioTypes";
import { AnalysisResult } from "./AnalysisResult";
import { CopilotSession } from "./CopilotSession";
import { RuleEngine } from "./RuleEngine";
import type { Suggestion } from "./Suggestion";
import type {
  CopilotEvent, CopilotListener, CopilotSessionSnapshot
} from "./types/CopilotTypes";

export class CopilotEngine {
  private suggestions: Suggestion[] = [];
  private readonly listeners = new Set<CopilotListener>();
  private studioSubscribed = false;
  private readonly studioListener: StudioListener = (event) => this.observeStudio(event);

  constructor(
    private readonly origin: MobiOrigin,
    private readonly studio: MobiStudio,
    private readonly rules = new RuleEngine(),
    private readonly session = new CopilotSession()
  ) {}

  createSession(id: string): CopilotSessionSnapshot {
    this.stopObservation();
    this.suggestions = [];
    return structuredClone(this.session.create(id));
  }

  startAnalysis(): void {
    this.session.start();
    if (!this.studioSubscribed) {
      this.studio.subscribe(this.studioListener);
      this.studioSubscribed = true;
    }
    this.notify({ type: "analysis-started" });
  }

  stopAnalysis(): void {
    this.session.stop();
    this.stopObservation();
    this.notify({ type: "analysis-stopped" });
  }

  analyzeProject(): AnalysisResult {
    this.session.requireAnalyzing();
    const project = this.origin.getProject();
    const result = new AnalysisResult(project.id, this.rules.analyze(project));
    this.suggestions = result.suggestions.map((suggestion) => structuredClone(suggestion));
    this.notify({ type: "analysis-completed", result });
    return structuredClone(result);
  }

  getSuggestions(): readonly Suggestion[] {
    return structuredClone(this.suggestions);
  }

  clearSuggestions(): void {
    this.suggestions = [];
    this.notify({ type: "suggestions-cleared" });
  }

  subscribe(listener: CopilotListener): void {
    this.listeners.add(listener);
  }

  unsubscribe(listener: CopilotListener): void {
    this.listeners.delete(listener);
  }

  private notify(event: CopilotEvent): void {
    for (const listener of this.listeners) listener(structuredClone(event));
  }

  private observeStudio(event: StudioEvent): void {
    if (event.type === "project-opened" || event.type === "project-saved") this.analyzeProject();
  }

  private stopObservation(): void {
    if (this.studioSubscribed) {
      this.studio.unsubscribe(this.studioListener);
      this.studioSubscribed = false;
    }
  }
}
