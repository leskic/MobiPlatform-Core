import type { ExecutionViewModel } from "./ExecutionViewModel";
import { defaultNewProjectDraft, type NewProjectDraft } from "./NewProjectDraft";
import type { LoadedProject } from "./ProjectFileLoader";
import { defaultFourWallState, type WallEditorState } from "./walls/WallModel";

export type AppRunStatus = "idle" | "creating-project" | "project-loaded" | "running" | "approved" | "rejected" | "error";

export interface AppState {
  readonly status: AppRunStatus;
  readonly project: LoadedProject | null;
  readonly draft: NewProjectDraft;
  readonly wallEditor: WallEditorState;
  readonly execution: ExecutionViewModel | null;
  readonly message: string | null;
}

export function initialAppState(): AppState {
  return Object.freeze({
    status: "idle",
    project: null,
    draft: defaultNewProjectDraft(),
    wallEditor: defaultFourWallState(),
    execution: null,
    message: null,
  });
}
