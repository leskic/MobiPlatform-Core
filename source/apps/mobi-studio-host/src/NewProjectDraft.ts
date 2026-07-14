export interface NewProjectDraft {
  readonly projectName: string;
  readonly clientName: string;
  readonly environmentName: string;
  readonly projectCode: string;
}

export function defaultNewProjectDraft(): NewProjectDraft {
  return Object.freeze({
    projectName: "Projeto Novo",
    clientName: "Cliente",
    environmentName: "Cozinha simples",
    projectCode: "PRJ-NOVO-001",
  });
}

export function normalizeDraft(input: Partial<NewProjectDraft>): NewProjectDraft {
  const fallback = defaultNewProjectDraft();
  return Object.freeze({
    projectName: clean(input.projectName) || fallback.projectName,
    clientName: clean(input.clientName) || fallback.clientName,
    environmentName: clean(input.environmentName) || fallback.environmentName,
    projectCode: clean(input.projectCode) || fallback.projectCode,
  });
}

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

