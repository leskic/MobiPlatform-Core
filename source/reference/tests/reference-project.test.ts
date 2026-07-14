import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ProjectParser } from "../../codec/ProjectParser";
import { ProjectFileLoader } from "../../apps/mobi-studio-host/src/ProjectFileLoader";
import { FlowRunner } from "../../platform-extensions/mobi-platform-flow-v1/src/index";
import { IndustrialValidationRunner } from "../../platform-extensions/mobi-platform-industrial-validation-v1/src/index";
import { RealProjectRunner } from "../../platform-extensions/mobi-platform-real-project-v1/src/index";

const referencePath = resolve(__dirname, "../ProjetoReferencia.mobi");
const referenceSource = () => readFileSync(referencePath, "utf8");
const projectId = "8f5d3e5c-7c1a-4a2f-9a11-02d3b75f1000";

describe("CP008 First Reference Project", () => {
  it("is a schema-valid Projeto.mobi with the required reference contents", () => {
    const parsed = ProjectParser.parse(referenceSource());

    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    const environment = parsed.project.environments[0];
    expect(parsed.project).toMatchObject({
      id: projectId,
      displayName: "Projeto Referência",
      status: "validated",
      schemaVersion: "1.0.0",
    });
    expect(parsed.project.metadata).toMatchObject({ client: "Cliente Referência", checkpoint: "CP008" });
    expect(environment?.displayName).toBe("Cozinha Referência");
    expect(environment?.architectures.filter((item) => item.type === "wall")).toHaveLength(4);
    expect(environment?.architectures.filter((item) => item.type === "opening")).toHaveLength(2);
    expect(environment?.infrastructures.map((item) => item.category).sort()).toEqual(["electrical", "sewer", "water"]);
    expect(environment?.modules.map((item) => item.type).sort()).toEqual(["base", "panel", "tower", "wall"]);
    expect(environment?.modules.flatMap((item) => item.parts).length).toBeGreaterThanOrEqual(8);
    expect(environment?.modules.flatMap((item) => item.hardwares).length).toBeGreaterThanOrEqual(5);
  });

  it("opens through the Mobi Studio Host project loader", () => {
    const loaded = new ProjectFileLoader().loadText(referenceSource(), "ProjetoReferencia.mobi");

    expect(loaded.success).toBe(true);
    if (loaded.success) {
      expect(loaded.project.projectId).toBe(projectId);
      expect(loaded.project.projectName).toBe("Projeto Referência");
    }
  });

  it("executes FlowRunner, Constructor, Industrial Validation and MobiView", () => {
    const flow = new FlowRunner().execute({ project: referenceSource(), sessionId: "cp008-reference-flow" });

    expect(flow.success).toBe(true);
    expect(flow.status).toBe("APPROVED");
    expect(flow.projectId).toBe(projectId);
    expect(flow.industrialSnapshot?.manifest.projectId).toBe(projectId);
    expect(flow.industrialSnapshot?.bom.lines.length).toBeGreaterThan(0);
    expect(flow.industrialSnapshot?.cam.paths.length).toBeGreaterThan(0);
    expect(flow.industrialSnapshot?.cam.operations.length).toBeGreaterThan(0);
    expect(flow.viewSnapshot).toMatchObject({
      projectId,
      production: { state: "COMPLETED", progress: 100 },
    });

    const validation = new IndustrialValidationRunner().validate(flow.industrialSnapshot);
    expect(validation.certified).toBe(true);
    expect(validation.status).toBe("CERTIFIED");
  });

  it("passes the complete real project runner reference scenario", () => {
    const result = new RealProjectRunner().execute({
      id: "cp008-reference-project",
      name: "CP008 First Reference Project",
      project: referenceSource(),
      expectation: {
        projectId,
        minimumSuccessPercent: 100,
      },
    });

    expect(result.approved).toBe(true);
    expect(result.execution.summary).toMatchObject({
      projectId,
      status: "APPROVED",
      finalResult: "SUCCESS",
    });
    expect(result.checklist.every((item) => item.passed)).toBe(true);
    expect(result.execution.summary.productsExecuted).toEqual([
      "FlowRunner",
      "Mobi Studio",
      "MobiConstructor",
      "Industrial Validation",
      "MobiView",
    ]);
  });
});
