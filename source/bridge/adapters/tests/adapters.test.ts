import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../../builder/ProjectBuilder";
import {
  architectureInput,
  environmentInput,
  hardwareInput,
  ids,
  infrastructureInput,
  moduleInput,
  partInput,
  projectInput
} from "../../../builder/tests/fixture";
import type { Project } from "../../../builder/types/ProjectTypes";
import { ProjectCodec } from "../../../codec/ProjectCodec";
import { MobiOrigin } from "../../../origin/MobiOrigin";
import { AdapterRegistry, type BridgeExportAdapter } from "../AdapterRegistry";
import { CsvPartsExporter } from "../CsvPartsExporter";
import { JsonBridgeExporter } from "../JsonBridgeExporter";

function validProject(): Project {
  return new ProjectBuilder()
    .createProject(projectInput)
    .addEnvironment(environmentInput)
    .addArchitecture(ids.environment, architectureInput)
    .addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput)
    .build();
}

function setup(): { origin: MobiOrigin; project: Project } {
  const project = validProject();
  const origin = new MobiOrigin();
  origin.openProject(ProjectCodec.serialize(project));
  return { origin, project };
}

describe("Mobi Bridge adapters", () => {
  it("registers and locates adapters in insertion order", () => {
    const { origin } = setup();
    const json = new JsonBridgeExporter(origin);
    const csv = new CsvPartsExporter(origin);
    const registry = new AdapterRegistry();
    registry.register(json);
    registry.register(csv);
    expect(registry.get("json-project")).toBe(json);
    expect(registry.get("missing")).toBeUndefined();
    expect(registry.list()).toEqual([json, csv]);
  });

  it("rejects duplicate adapter identifiers", () => {
    const adapter: BridgeExportAdapter = { id: "same", export: () => "" };
    const registry = new AdapterRegistry();
    registry.register(adapter);
    expect(() => registry.register(adapter)).toThrow("already registered");
  });

  it("exports canonical deterministic JSON", () => {
    const { origin, project } = setup();
    const exporter = new JsonBridgeExporter(origin);
    const first = exporter.export();
    const second = exporter.export();
    expect(first).toBe(second);
    expect(JSON.parse(first)).toEqual(project);
    expect(first.indexOf('"code"')).toBeLessThan(first.indexOf('"createdAt"'));
  });

  it("exports all Parts as deterministic CSV rows", () => {
    const { origin } = setup();
    const exporter = new CsvPartsExporter(origin);
    const first = exporter.export();
    expect(exporter.export()).toBe(first);
    const lines = first.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("environmentId,moduleId,id,parentId,category,type");
    expect(lines[1]).toContain(`${ids.environment},${ids.module},${ids.part},${ids.module}`);
    expect(lines[1]).toContain("720,560,15");
    expect(lines[1]).toContain("MDF-15,lengthwise");
  });

  it("exports only the header when the project has no Parts", () => {
    const { origin, project } = setup();
    project.environments[0]!.modules[0]!.parts = [];
    origin.openProject(ProjectCodec.serialize(project));
    expect(new CsvPartsExporter(origin).export().split("\n")).toHaveLength(1);
  });

  it("escapes CSV text without changing source data", () => {
    const { origin, project } = setup();
    project.environments[0]!.modules[0]!.parts[0]!.materialId = 'MDF "A", branco';
    origin.openProject(ProjectCodec.serialize(project));
    const before = origin.getProject();
    const output = new CsvPartsExporter(origin).export();
    expect(output).toContain('"MDF ""A"", branco"');
    expect(origin.getProject()).toEqual(before);
  });

  it("isolates registry and adapter state", () => {
    const { origin } = setup();
    const first = new AdapterRegistry();
    const second = new AdapterRegistry();
    first.register(new JsonBridgeExporter(origin));
    expect(first.list()).toHaveLength(1);
    expect(second.list()).toEqual([]);
  });

  it("does not mutate Project.mobi during either export", () => {
    const { origin, project } = setup();
    new JsonBridgeExporter(origin).export();
    new CsvPartsExporter(origin).export();
    expect(origin.getProject()).toEqual(project);
  });
});
