import { CopilotError } from "./types/CopilotError";
import type { CopilotSessionSnapshot } from "./types/CopilotTypes";

export class CopilotSession {
  private id: string | undefined;
  private analyzing = false;

  create(id: string): CopilotSessionSnapshot {
    this.id = id;
    this.analyzing = false;
    return this.get();
  }

  start(): void {
    this.requireActive();
    this.analyzing = true;
  }

  stop(): void {
    this.requireActive();
    this.analyzing = false;
  }

  requireAnalyzing(): void {
    this.requireActive();
    if (!this.analyzing) throw new CopilotError("ANALYSIS_NOT_STARTED", "Analysis has not been started");
  }

  get(): CopilotSessionSnapshot {
    return { id: this.id ?? "", active: this.id !== undefined, analyzing: this.analyzing };
  }

  private requireActive(): void {
    if (this.id === undefined) throw new CopilotError("NO_ACTIVE_SESSION", "No active Copilot session");
  }
}
