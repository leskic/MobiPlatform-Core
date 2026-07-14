import type { ExecutionViewModel } from "./ExecutionViewModel";
import type { LoadedProject } from "./ProjectFileLoader";

export type AppRunStatus = "idle" | "project-loaded" | "running" | "approved" | "rejected" | "error";

export interface AppState {
  readonly status: AppRunStatus;
  readonly project: LoadedProject | null;
  readonly execution: ExecutionViewModel | null;
  readonly message: string | null;
}

export function initialAppState(): AppState {
  return Object.freeze({
    status: "idle",
    project: null,
    execution: null,
    message: null,
  });
}

