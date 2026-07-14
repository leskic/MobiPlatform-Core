import { describe, expect, it } from "vitest";
import { DoorCommands } from "../src/doors/DoorCommands";
import { emptyDoorEditorState } from "../src/doors/DoorModel";
import { normalizeDraft } from "../src/NewProjectDraft";
import { ProjectFileLoader } from "../src/ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "../src/SimpleKitchenProjectFactory";
import { TechnicalDocumentationFactory } from "../src/TechnicalDocumentationViewModel";
import { TechnicalDocumentationView } from "../src/ui/TechnicalDocumentationView";
import { defaultFourWallState } from "../src/walls/WallModel";

const draft = normalizeDraft({
  projectName: "Caderno Cozinha",
  clientName: "Cliente Tecnico",
  environmentName: "Cozinha Tecnica",
  projectCode: "CAD-001",
});

function loadedProject() {
  const doors = new DoorCommands(emptyDoorEditorState()).addDoor(defaultFourWallState(), { wallId: "wall-1" });
  const source = new SimpleKitchenProjectFactory().createJson(draft, defaultFourWallState(), doors);
  const loaded = new ProjectFileLoader().loadText(source, "CAD-001.mobi");
  if (!loaded.success) throw new Error(loaded.message);
  return loaded.project.project;
}

describe("CP012 Technical Documentation", () => {
  it("creates a technical documentation model from Projeto.mobi", () => {
    const documentation = new TechnicalDocumentationFactory().create(loadedProject());

    expect(documentation).toMatchObject({
      projectName: "Caderno Cozinha",
      projectCode: "CAD-001",
      status: "validated",
    });
    expect(documentation.environments[0]?.name).toBe("Cozinha Tecnica");
    expect(documentation.environments[0]?.walls).toHaveLength(4);
    expect(documentation.environments[0]?.doors).toHaveLength(1);
  });

  it("exposes main wall and door dimensions", () => {
    const environment = new TechnicalDocumentationFactory().create(loadedProject()).environments[0];

    expect(environment?.walls[0]).toMatchObject({ length: 3000, height: 2700, thickness: 150 });
    expect(environment?.doors[0]).toMatchObject({ width: 800, height: 2100 });
  });

  it("renders project data, environments, walls and doors", () => {
    const documentation = new TechnicalDocumentationFactory().create(loadedProject());
    const html = new TechnicalDocumentationView().render(documentation);

    expect(html).toContain("Caderno Tecnico");
    expect(html).toContain("Caderno Cozinha");
    expect(html).toContain("Cozinha Tecnica");
    expect(html).toContain("Paredes");
    expect(html).toContain("Portas");
    expect(html).toContain("3000 mm");
    expect(html).toContain("2100 mm");
  });

  it("keeps out-of-scope industrial content out of CP012 documentation", () => {
    const html = new TechnicalDocumentationView().render(new TechnicalDocumentationFactory().create(loadedProject()));

    expect(html).not.toContain("BOM");
    expect(html).not.toContain("CAM");
    expect(html).not.toContain("Plano de corte");
  });

  it("renders an empty state before a project is loaded", () => {
    const html = new TechnicalDocumentationView().render(null);

    expect(html).toContain("Crie ou abra um Projeto.mobi");
  });
});

