import type { EnvironmentDraft, EnvironmentEditorState, EnvironmentItem } from "./EnvironmentModel";

export class EnvironmentCommands {
  constructor(private state: EnvironmentEditorState) {}

  addEnvironment(draft: EnvironmentDraft = {}): EnvironmentEditorState {
    const next = this.state.environments.length + 1;
    const environment = Object.freeze({
      id: `environment-${next}`,
      name: normalizeName(draft.name, `Ambiente ${next}`),
    });
    return this.nextState([...this.state.environments, environment], environment.id);
  }

  renameSelected(draft: EnvironmentDraft): EnvironmentEditorState {
    if (!this.state.selectedEnvironmentId) return this.state;
    const environments = this.state.environments.map((environment) =>
      environment.id === this.state.selectedEnvironmentId
        ? Object.freeze({ ...environment, name: normalizeName(draft.name, environment.name) })
        : environment
    );
    return this.nextState(environments, this.state.selectedEnvironmentId);
  }

  deleteSelected(): EnvironmentEditorState {
    if (!this.state.selectedEnvironmentId) return this.state;
    const environments = this.state.environments.filter((environment) => environment.id !== this.state.selectedEnvironmentId);
    return this.nextState(environments, environments[0]?.id ?? null);
  }

  selectEnvironment(id: string | null): EnvironmentEditorState {
    const selected = this.state.environments.some((environment) => environment.id === id) ? id : this.state.selectedEnvironmentId;
    return this.nextState(this.state.environments, selected);
  }

  private nextState(environments: readonly EnvironmentItem[], selectedEnvironmentId: string | null): EnvironmentEditorState {
    this.state = Object.freeze({
      environments: Object.freeze([...environments]),
      selectedEnvironmentId,
    });
    return this.state;
  }
}

function normalizeName(name: string | undefined, fallback: string): string {
  const normalized = name?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}
