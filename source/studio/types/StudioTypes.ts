import type { Project } from "../../builder/types/ProjectTypes";

export type StudioStatus = "no-session" | "ready" | "project-open";

export interface StudioStateSnapshot {
  sessionId: string | null;
  status: StudioStatus;
  hasProject: boolean;
  projectId: string | null;
}

export type StudioEventType =
  | "session-created"
  | "project-opened"
  | "project-saved"
  | "project-closed";

export interface StudioEvent {
  type: StudioEventType;
  state: StudioStateSnapshot;
}

export type StudioListener = (event: StudioEvent) => void;

export interface StudioSessionSnapshot {
  id: string;
  active: boolean;
}

export type StudioProject = Project;
