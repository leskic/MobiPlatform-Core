import { describe, expect, it } from "vitest";
import { normalizeDraft } from "../src/NewProjectDraft";
import { defaultExpanded, PartsHierarchyFactory, toggleExpanded } from "../src/PartsHierarchyViewModel";
import { ProjectFileLoader } from "../src/ProjectFileLoader";
import { SimpleKitchenProjectFactory } from "../src/SimpleKitchenProjectFactory";
import { PartsHierarchyView } from "../src/ui/PartsHierarchyView";
import { defaultFourWallState } from "../src/walls/WallModel";

const draft = normalizeDraft({
  projectName: "Projeto Hierarquia",
  clientName: "Cliente Hierarquia",
  environmentName: "Cozinha",
  projectCode: "PARTS-HIERARCHY-001",
});

function loadedProject() {
  const source = new SimpleKitchenProjectFactory().createJson(draft, defaultFourWallState());
  const loaded = new ProjectFileLoader().loadText(source, "PARTS-HIERARCHY-001.mobi");
  if (!loaded.success) throw new Error(loaded.message);
  return loaded.project.project;
}

describe("CP015 Parts Hierarchy", () => {
  it("builds the hierarchy Project to Environment to Module to Part", () => {
    const hierarchy = new PartsHierarchyFactory().create(loadedProject());

    expect(hierarchy.projectName).toBe("Projeto Hierarquia");
    expect(hierarchy.environments).toHaveLength(1);
    expect(hierarchy.environments[0]?.modules.length).toBeGreaterThan(0);
    expect(hierarchy.environments[0]?.modules[0]?.parts.length).toBeGreaterThan(0);
  });

  it("shows part quantity by module", () => {
    const hierarchy = new PartsHierarchyFactory().create(loadedProject());
    const module = hierarchy.environments[0]?.modules[0];

    expect(module?.partCount).toBe(module?.parts.length);
    expect(module?.partCount).toBeGreaterThan(0);
  });

  it("opens project, environment, and module levels by default", () => {
    const project = loadedProject();
    const expanded = defaultExpanded(project);

    expect(expanded).toContain(project.id);
    expect(expanded).toContain(project.environments[0]?.id);
    expect(expanded).toContain(project.environments[0]?.modules[0]?.id);
  });

  it("expands and collapses tree nodes", () => {
    const project = loadedProject();
    const collapsed = toggleExpanded(defaultExpanded(project), project.id);
    const expanded = toggleExpanded(collapsed, project.id);

    expect(collapsed).not.toContain(project.id);
    expect(expanded).toContain(project.id);
  });

  it("renders hierarchy, module counts, and part selection", () => {
    const base = new PartsHierarchyFactory().create(loadedProject());
    const selectedPartId = base.environments[0]?.modules[0]?.parts[0]?.id ?? null;
    const hierarchy = new PartsHierarchyFactory().create(loadedProject(), base.expandedNodeIds, selectedPartId);
    const html = new PartsHierarchyView().render(hierarchy);

    expect(html).toContain("Parts Hierarchy");
    expect(html).toContain("Projeto Hierarquia");
    expect(html).toContain("parts");
    expect(html).toContain("data-tree-toggle=");
    expect(html).toContain("data-tree-part-id=");
    expect(html).toContain("tree-part selected");
  });

  it("does not render out-of-scope industrial features", () => {
    const html = new PartsHierarchyView().render(new PartsHierarchyFactory().create(loadedProject()));

    expect(html).not.toContain("BOM");
    expect(html).not.toContain("CAM");
    expect(html).not.toContain("Plano de corte");
    expect(html).not.toContain("Custo");
  });

  it("renders an empty state before project load", () => {
    const html = new PartsHierarchyView().render(null);

    expect(html).toContain("Crie ou abra um Projeto.mobi");
  });
});
