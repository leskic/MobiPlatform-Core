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
  projectInput,
} from "../../../builder/tests/fixture";
import type { IndustrialContractSnapshot } from "../../../mobi-products/mobi-constructor/src/index";
import { FlowRunner } from "../../mobi-platform-flow-v1/src/index";
import { FlowDiagnostics, IndustrialValidationRunner } from "../src/index";

function snapshot(): IndustrialContractSnapshot {
  const project = new ProjectBuilder()
    .createProject(projectInput)
    .addEnvironment(environmentInput)
    .addArchitecture(ids.environment, architectureInput)
    .addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput)
    .build();
  const result = new FlowRunner().execute({ project });
  if (!result.industrialSnapshot) throw new Error("TEST_SNAPSHOT_NOT_CREATED");
  return result.industrialSnapshot;
}

describe("CP004 Industrial Validation", () => {
  it("rejects an inconsistent ProductionManifest", () => {
    const source = snapshot();
    const result = new IndustrialValidationRunner().validate({
      ...source,
      manifest: {
        ...source.manifest,
        indicators: { ...source.manifest.indicators, partCount: 9 },
      },
    });

    expect(result).toMatchObject({ certified: false, status: "REJECTED" });
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ stage: "MANIFEST", code: "MANIFEST_PART_COUNT_MISMATCH", severity: "error" }),
    ]));
  });

  it("rejects an inconsistent BOM", () => {
    const source = snapshot();
    const result = new IndustrialValidationRunner().validate({
      ...source,
      bom: {
        ...source.bom,
        lines: [{ ...source.bom.lines[0]!, quantity: 0 }],
      },
    });

    expect(result.certified).toBe(false);
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ stage: "BOM", code: "BOM_LINE_QUANTITY_INVALID" }),
    ]));
  });

  it("rejects an inconsistent CAM package", () => {
    const source = snapshot();
    const result = new IndustrialValidationRunner().validate({
      ...source,
      cam: {
        ...source.cam,
        operations: [{ ...source.cam.operations[0]!, pathId: "missing-path" }],
      },
    });

    expect(result.certified).toBe(false);
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ stage: "CAM", code: "CAM_OPERATION_PATH_MISSING" }),
    ]));
  });

  it("certifies a complete industrial snapshot", () => {
    const result = new IndustrialValidationRunner().validate(snapshot());

    expect(result).toMatchObject({
      certified: true,
      status: "CERTIFIED",
      summary: {
        projectId: ids.project,
        certified: true,
        manifestParts: 1,
        bomLines: 2,
        camPaths: 1,
        camOperations: 2,
      },
    });
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "TRANSACTIONS_PORT_AVAILABLE", severity: "info" }),
      expect.objectContaining({ code: "INDUSTRIAL_CHAIN_CONSISTENT", severity: "info" }),
    ]));
  });

  it("rejects an invalid snapshot", () => {
    const result = new IndustrialValidationRunner().validate(null);

    expect(result).toMatchObject({
      certified: false,
      status: "REJECTED",
      summary: { projectId: null, manifestParts: 0 },
    });
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ stage: "CONSISTENCY", code: "SNAPSHOT_REQUIRED", severity: "error" }),
    ]);
  });

  it("produces structured diagnostics", () => {
    const diagnostics = new FlowDiagnostics();
    diagnostics.info("MANIFEST", "A", "info");
    diagnostics.warning("BOM", "B", "warning", "line");
    diagnostics.error("CAM", "C", "error");

    expect(diagnostics.valid).toBe(false);
    expect(diagnostics.snapshot()).toEqual([
      { stage: "MANIFEST", severity: "info", code: "A", message: "info" },
      { stage: "BOM", severity: "warning", code: "B", message: "warning", entity: "line" },
      { stage: "CAM", severity: "error", code: "C", message: "error" },
    ]);
  });

  it("approves a FlowRunner snapshot before downstream consumption", () => {
    const flow = new FlowRunner().execute({ project: new ProjectBuilder()
      .createProject(projectInput)
      .addEnvironment(environmentInput)
      .addArchitecture(ids.environment, architectureInput)
      .addInfrastructure(ids.environment, infrastructureInput)
      .addModule(ids.environment, moduleInput)
      .addPart(ids.module, partInput)
      .addHardware(ids.module, hardwareInput)
      .build() });

    const validation = new IndustrialValidationRunner().validate(flow.industrialSnapshot);

    expect(flow.success).toBe(true);
    expect(validation.certified).toBe(true);
    expect(validation.summary.projectId).toBe(flow.projectId);
  });
});
