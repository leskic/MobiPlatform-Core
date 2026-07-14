import { describe, expect, it } from "vitest";
import { EnvironmentCommands } from "../src/environments/EnvironmentCommands";
import { emptyEnvironmentEditorState, environmentStateFromProject } from "../src/environments/EnvironmentModel";
import { normalizeDraft } from "../src/NewProjectDraft";
import { ProjectFileLoader } from "../src/ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "../src/SimpleKitchenProjectFactory";
import { EnvironmentEditorView } from "../src/ui/EnvironmentEditorView";

const draft = normalizeDraft({
  projectName: "Projeto Ambientes",
  clientName: "Cliente Ambientes",
  environmentName: "Cozinha",
  projectCode: "ENV-001",
});

describe("CP016 Environment Editor Foundation", () => {
  it("creates and selects environments", () => {
    const editor = new EnvironmentCommands(emptyEnvironmentEditorState()).addEnvironment({ name: "Cozinha" });

    expect(editor.environments).toHaveLength(1);
    expect(editor.environments[0]?.name).toBe("Cozinha");
    expect(editor.selectedEnvironmentId).toBe(editor.environments[0]?.id);
  });

  it("renames the selected environment", () => {
    const commands = new EnvironmentCommands(emptyEnvironmentEditorState());
    commands.addEnvironment({ name: "Cozinha" });
    const editor = commands.renameSelected({ name: "Area Gourmet" });

    expect(editor.environments[0]?.name).toBe("Area Gourmet");
  });

  it("deletes the selected environment", () => {
    const commands = new EnvironmentCommands(emptyEnvironmentEditorState());
    commands.addEnvironment({ name: "Cozinha" });
    commands.addEnvironment({ name: "Lavanderia" });
    const editor = commands.deleteSelected();

    expect(editor.environments).toHaveLength(1);
    expect(editor.environments[0]?.name).toBe("Cozinha");
    expect(editor.selectedEnvironmentId).toBe(editor.environments[0]?.id);
  });

  it("renders listing, selection, and editing controls", () => {
    const editor = new EnvironmentCommands(emptyEnvironmentEditorState()).addEnvironment({ name: "Cozinha" });
    const html = new EnvironmentEditorView().render(editor);

    expect(html).toContain("Environment Editor");
    expect(html).toContain("Adicionar Ambiente");
    expect(html).toContain("Renomear Ambiente");
    expect(html).toContain("data-environment-id=");
    expect(html).toContain("environment-row selected");
  });

  it("persists environments through Projeto.mobi public contracts", () => {
    const commands = new EnvironmentCommands(emptyEnvironmentEditorState());
    commands.addEnvironment({ name: "Cozinha" });
    const editor = commands.addEnvironment({ name: "Lavanderia" });
    const source = new SimpleKitchenProjectFactory().createJson(draft, undefined, undefined, editor);
    const loaded = new ProjectFileLoader().loadText(source, "ENV-001.mobi");

    expect(loaded.success).toBe(true);
    if (loaded.success) {
      expect(loaded.project.project.environments.map((environment) => environment.displayName)).toEqual(["Cozinha", "Lavanderia"]);
    }
  });

  it("loads environment editor state from an opened project", () => {
    const commands = new EnvironmentCommands(emptyEnvironmentEditorState());
    commands.addEnvironment({ name: "Cozinha" });
    const source = new SimpleKitchenProjectFactory().createJson(draft, undefined, undefined, commands.addEnvironment({ name: "Lavanderia" }));
    const loaded = new ProjectFileLoader().loadText(source, "ENV-001.mobi");
    if (!loaded.success) throw new Error(loaded.message);

    const editor = environmentStateFromProject(loaded.project.project);

    expect(editor.environments.map((environment) => environment.name)).toEqual(["Cozinha", "Lavanderia"]);
    expect(editor.selectedEnvironmentId).toBe(editor.environments[0]?.id);
  });

  it("does not render out-of-scope industrial controls", () => {
    const html = new EnvironmentEditorView().render(emptyEnvironmentEditorState());

    expect(html).not.toContain("BOM");
    expect(html).not.toContain("CAM");
    expect(html).not.toContain("Producao");
    expect(html).not.toContain("Modulo");
  });
});
