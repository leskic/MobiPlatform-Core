import type { StudioStateSnapshot, StudioStatus } from "./types/StudioTypes";

export class StudioState {
  private sessionId: string | null = null;
  private projectId: string | null = null;

  setSession(id: string): void {
    this.sessionId = id;
    this.projectId = null;
  }

  setProject(id: string): void {
    this.projectId = id;
  }

  clearProject(): void {
    this.projectId = null;
  }

  get(): StudioStateSnapshot {
    const status: StudioStatus = this.sessionId === null
      ? "no-session"
      : this.projectId === null ? "ready" : "project-open";
    return {
      sessionId: this.sessionId,
      status,
      hasProject: this.projectId !== null,
      projectId: this.projectId
    };
  }
}
