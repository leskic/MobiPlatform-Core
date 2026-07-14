import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  BOMSelectionBridge,
  BOMViewerController,
  MIC_VERSION,
  SceneGraph,
  SelectionController,
  type BOMOutput,
  type PublicBOMLine,
} from "../src/index";
import { environmentInput, ids, moduleInput, partInput, ProjectBuilder, projectInput } from "./fixtures";

const lines: readonly PublicBOMLine[] = [
  {
    id: "bom:material:mdf",
    kind: "MATERIAL",
    key: "MDF-15",
    quantity: 2,
    areaMm2: 200,
    volumeMm3: 3000,
    sourceEntityIds: [ids.part],
  },
  {
    id: "bom:hardware:hinge",
    kind: "HARDWARE",
    key: "HINGE-01",
    quantity: 4,
    areaMm2: 0,
    volumeMm3: 0,
    sourceEntityIds: [ids.hardware],
  },
  {
    id: "bom:material:oak",
    kind: "MATERIAL",
    key: "OAK-18",
    quantity: 1,
    areaMm2: 100,
    volumeMm3: 1800,
    sourceEntityIds: ["external-entity"],
  },
];

function bom(sourceLines: readonly PublicBOMLine[] = lines): BOMOutput {
  return {
    contract: "mobi.bom-output",
    version: MIC_VERSION,
    projectId: ids.project,
    lines: sourceLines,
    totals: { partCount: 3, hardwareCount: 4, areaMm2: 300, volumeMm3: 4800 },
    groupingKeys: ["HARDWARE:HINGE-01", "MATERIAL:MDF-15", "MATERIAL:OAK-18"],
  };
}

function selectionSetup() {
  const project = new ProjectBuilder()
    .createProject(projectInput)
    .addEnvironment(environmentInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .build();
  const scene = new SceneGraph();
  scene.build(project);
  const selection = new SelectionController(scene);
  return { selection, bridge: new BOMSelectionBridge(selection) };
}

describe("CP002-C BOM Viewer", () => {
  it("renders an empty BOM without manufacturing calculations", () => {
    const controller = new BOMViewerController();
    const view = controller.connect(bom([]));
    expect(view).toEqual({
      component: "BOM_VIEWER",
      hasData: true,
      projectId: ids.project,
      version: MIC_VERSION,
      lines: [],
      groups: [],
    });
    expect(controller.update(null)).toMatchObject({ hasData: false, lines: [] });
  });

  it("lists a valid BOM and preserves every public value", () => {
    const controller = new BOMViewerController();
    const view = controller.connect(bom());

    expect(view.lines).toEqual(lines);
    expect(controller.getState().totals).toEqual(bom().totals);
    expect(controller.getState().groupingKeys).toEqual(bom().groupingKeys);
    expect(view.lines).not.toBe(lines);
    expect(controller.update(bom([lines[0]!])).lines).toEqual([lines[0]]);
  });

  it("searches only public textual fields and sourceEntityIds", () => {
    const controller = new BOMViewerController();
    controller.connect(bom());

    expect(controller.view({ query: "hinge" }).lines.map((line) => line.id)).toEqual([
      "bom:hardware:hinge",
    ]);
    expect(controller.view({ query: ids.part }).lines.map((line) => line.id)).toEqual([
      "bom:material:mdf",
    ]);
  });

  it("filters by public kind and key without changing the source BOM", () => {
    const source = bom();
    const controller = new BOMViewerController();
    controller.connect(source);

    expect(controller.view({ kinds: ["MATERIAL"], keys: ["OAK-18"] }).lines).toEqual([
      lines[2],
    ]);
    expect(source.lines).toEqual(lines);
  });

  it("groups lines by kind and key without producing aggregate totals", () => {
    const controller = new BOMViewerController();
    controller.connect(bom());

    expect(controller.view({ groupBy: "KIND" }).groups).toEqual([
      { key: "MATERIAL", lines: [lines[0], lines[2]] },
      { key: "HARDWARE", lines: [lines[1]] },
    ]);
    expect(controller.view({ groupBy: "KEY" }).groups.map((group) => group.key)).toEqual([
      "MDF-15",
      "HINGE-01",
      "OAK-18",
    ]);
  });

  it("orders copied rows by public fields in both directions", () => {
    const controller = new BOMViewerController();
    controller.connect(bom());

    expect(controller.view({ sortBy: "quantity", direction: "ASC" }).lines.map((line) => line.quantity)).toEqual([1, 2, 4]);
    expect(controller.view({ sortBy: "key", direction: "DESC" }).lines.map((line) => line.key)).toEqual(["OAK-18", "MDF-15", "HINGE-01"]);
  });

  it("synchronizes an explicit sourceEntityId with SelectionController", () => {
    const { selection, bridge } = selectionSetup();
    const controller = new BOMViewerController(undefined, undefined, undefined, bridge);
    controller.connect(bom());

    expect(controller.select("bom:material:mdf", ids.part)).toEqual({
      success: true,
      entityId: ids.part,
    });
    expect(selection.get().entityId).toBe(ids.part);
    controller.disconnect();
    expect(selection.get().entityId).toBeNull();
  });

  it("blocks missing, unrelated and invisible sourceEntityIds", () => {
    const { bridge } = selectionSetup();
    const controller = new BOMViewerController(undefined, undefined, undefined, bridge);
    controller.connect(bom());

    expect(controller.select("missing-line", ids.part)).toEqual({ success: false, code: "INVALID_SOURCE_ENTITY_ID" });
    expect(controller.select("bom:material:mdf", "unrelated")).toEqual({ success: false, code: "INVALID_SOURCE_ENTITY_ID" });
    expect(controller.select("bom:material:oak", "external-entity")).toEqual({ success: false, code: "INVALID_SOURCE_ENTITY_ID" });
    expect(new BOMViewerController().select("bom:material:mdf", ids.part)).toEqual({ success: false, code: "INVALID_SOURCE_ENTITY_ID" });
    const unexpected = new BOMSelectionBridge({
      select: () => { throw new Error("UNEXPECTED_SELECTION_FAILURE"); },
      clear: () => ({ entityId: null, highlightedMeshId: null }),
    } as unknown as SelectionController);
    expect(() => unexpected.select(lines[0]!, ids.part)).toThrow("UNEXPECTED_SELECTION_FAILURE");
  });

  it("imports only BOMOutput and PublicBOMLine from the public MIC boundary", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src/bom-viewer");
    const source = typescriptFiles(root).map((file) => readFileSync(file, "utf8")).join("\n");

    expect(source).toContain("BOMOutput");
    expect(source).toContain("PublicBOMLine");
    expect(source).not.toMatch(/\b(ProductionManifest|NeutralCAMPackage|ProductionFeedbackStream|IndustrialTransactionPort|IndustrialContractSnapshot)\b/);
    expect(source).not.toContain("mobi-constructor/");
    expect(source).not.toMatch(/\/(pipelines?|providers?|managers?|builders?|engines?)\//i);
  });
});

function typescriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? typescriptFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}
