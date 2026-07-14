import { describe, expect, it } from "vitest";
import { normalizeDraft } from "../src/NewProjectDraft";
import { PartsFoundationFactory } from "../src/PartsFoundationViewModel";
import { ProjectFileLoader } from "../src/ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "../src/SimpleKitchenProjectFactory";
import { PartsFoundationView } from "../src/ui/PartsFoundationView";
import { defaultFourWallState } from "../src/walls/WallModel";

const draft = normalizeDraft({
  projectName: "Projeto com Pecas",
  clientName: "Cliente Pecas",
  environmentName: "Cozinha",
  projectCode: "PARTS-001",
});

function loadedProject() {
  const source = new SimpleKitchenProjectFactory().createJson(draft, defaultFourWallState());
  const loaded = new ProjectFileLoader().loadText(source, "PARTS-001.mobi");
  if (!loaded.success) throw new Error(loaded.message);
  return loaded.project.project;
}

describe("CP013 Parts Foundation", () => {
  it("extracts base parts from Projeto.mobi", () => {
    const parts = new PartsFoundationFactory().create(loadedProject());

    expect(parts.projectName).toBe("Projeto com Pecas");
    expect(parts.totalParts).toBeGreaterThan(0);
    expect(parts.parts[0]).toMatchObject({
      moduleId: expect.any(String),
      moduleName: expect.any(String),
      type: expect.any(String),
      category: expect.any(String),
      materialId: expect.any(String),
    });
    expect(parts.selectedPartId).toBe(parts.parts[0]?.id);
    expect(parts.selectedPart).toEqual(parts.parts[0]);
  });

  it("selects a part for direct inspection", () => {
    const base = new PartsFoundationFactory().create(loadedProject());
    const selected = new PartsFoundationFactory().create(loadedProject(), base.parts[2]?.id ?? null);

    expect(selected.selectedPartId).toBe(base.parts[2]?.id);
    expect(selected.selectedPart?.moduleId).toBe(base.parts[2]?.moduleId);
  });

  it("keeps the association between part and module", () => {
    const parts = new PartsFoundationFactory().create(loadedProject()).parts;

    expect(parts.map((part) => part.moduleName)).toEqual(expect.arrayContaining([
      "Modulo inferior",
      "Modulo aereo",
      "Torre",
      "Tampo",
    ]));
  });

  it("exposes primary dimensions and material when available", () => {
    const part = new PartsFoundationFactory().create(loadedProject()).parts[0];

    expect(part?.width).toBeGreaterThan(0);
    expect(part?.height).toBeGreaterThan(0);
    expect(part?.thickness).toBeGreaterThan(0);
    expect(part?.materialId).not.toBe("");
  });

  it("renders the parts foundation view", () => {
    const html = new PartsFoundationView().render(new PartsFoundationFactory().create(loadedProject()));

    expect(html).toContain("Parts Foundation");
    expect(html).toContain("pecas");
    expect(html).toContain("Modulo");
    expect(html).toContain("Dimensoes");
    expect(html).toContain("Material");
  });

  it("renders a dedicated parts inspector with navigation", () => {
    const html = new PartsFoundationView().render(new PartsFoundationFactory().create(loadedProject()));

    expect(html).toContain("Parts Inspector");
    expect(html).toContain("Anterior");
    expect(html).toContain("Proxima");
    expect(html).toContain("data-part-id=");
    expect(html).toContain("parts-row-button selected");
  });

  it("does not render out-of-scope industrial outputs", () => {
    const html = new PartsFoundationView().render(new PartsFoundationFactory().create(loadedProject()));

    expect(html).not.toContain("BOM");
    expect(html).not.toContain("CAM");
    expect(html).not.toContain("Plano de corte");
    expect(html).not.toContain("Custo");
  });

  it("renders an empty state before a project is loaded", () => {
    const html = new PartsFoundationView().render(null);

    expect(html).toContain("Crie ou abra um Projeto.mobi");
  });
});
