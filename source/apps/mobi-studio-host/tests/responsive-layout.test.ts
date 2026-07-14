import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { emptyDoorEditorState } from "../src/doors/DoorModel";
import { normalizeDraft } from "../src/NewProjectDraft";
import { StudioShellView } from "../src/ui/StudioShellView";
import { defaultFourWallState } from "../src/walls/WallModel";

const styles = () => readFileSync(resolve(__dirname, "../src/styles.css"), "utf8");

describe("CP011 responsive host layout fix", () => {
  it("keeps the application constrained to the viewport without global horizontal overflow", () => {
    const css = styles();

    expect(css).toContain("overflow-x: hidden");
    expect(css).toContain("width: min(100%, 100vw)");
    expect(css).toContain("min-width: 0");
  });

  it("uses fluid responsive grids instead of oversized fixed columns", () => {
    const css = styles();

    expect(css).toContain("grid-template-columns: minmax(220px, 28vw) minmax(0, 1fr)");
    expect(css).toContain("@media (max-width: 1100px)");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr)");
  });

  it("keeps Wall Editor and Door Editor canvases proportional to available width", () => {
    const css = styles();

    expect(css).toContain("aspect-ratio: 16 / 10");
    expect(css).toContain("aspect-ratio: 16 / 5");
    expect(css).not.toContain("min-height: 260px");
    expect(css).not.toContain("min-height: 120px");
  });

  it("allows controls and inspectors to wrap under zoom or narrow windows", () => {
    const css = styles();

    expect(css).toContain("flex-wrap: wrap");
    expect(css).toContain("flex: 1 1 120px");
    expect(css).toContain("minmax(min(130px, 100%), 1fr)");
    expect(css).toContain("minmax(min(150px, 100%), 1fr)");
  });

  it("preserves the visible Wall and Door Editor actions in the shell", () => {
    const html = new StudioShellView().render({
      status: "creating-project",
      project: null,
      draft: normalizeDraft({ projectName: "Layout", clientName: "Cliente", environmentName: "Cozinha", projectCode: "LAYOUT" }),
      wallEditor: defaultFourWallState(),
      doorEditor: emptyDoorEditorState(),
      technicalDocumentation: null,
      partsFoundation: null,
      partsHierarchy: null,
      execution: null,
      message: null,
    });

    expect(html).toContain("Wall Editor");
    expect(html).toContain("Door Editor");
    expect(html).toContain("Adicionar Parede");
    expect(html).toContain("Inserir Porta");
  });
});
