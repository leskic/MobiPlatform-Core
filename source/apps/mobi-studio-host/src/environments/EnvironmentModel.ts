import type { Project } from "../../../../builder/types/ProjectTypes";

export interface EnvironmentDraft {
  readonly name?: string;
}

export interface EnvironmentItem {
  readonly id: string;
  readonly name: string;
}

export interface EnvironmentEditorState {
  readonly environments: readonly EnvironmentItem[];
  readonly selectedEnvironmentId: string | null;
}

export function emptyEnvironmentEditorState(): EnvironmentEditorState {
  return Object.freeze({
    environments: [],
    selectedEnvironmentId: null,
  });
}

export function environmentStateFromProject(project: Project): EnvironmentEditorState {
  const environments = project.environments.map((environment) => Object.freeze({
    id: environment.id,
    name: environment.displayName,
  }));
  return Object.freeze({
    environments,
    selectedEnvironmentId: environments[0]?.id ?? null,
  });
}

