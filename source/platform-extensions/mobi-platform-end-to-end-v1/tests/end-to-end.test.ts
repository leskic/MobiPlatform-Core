import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
import { FlowRunner, type FlowExecutionResult } from "../../mobi-platform-flow-v1/src/index";
import type { IndustrialValidationResult } from "../../mobi-platform-industrial-validation-v1/src/index";
import { EndToEndRunner } from "../src/index";

function project() {
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

describe("CP005 End-to-End Execution", () => {
  it("executes a real Projeto.mobi through the complete platform chain", () => {
    const result = new EndToEndRunner().execute({ project: project(), sessionId: "cp005" });

    expect(result.success).toBe(true);
    expect(result.summary).toMatchObject({
      projectId: ids.project,
      status: "APPROVED",
      finalResult: "SUCCESS",
      productsExecuted: ["FlowRunner", "Mobi Studio", "MobiConstructor", "Industrial Validation", "MobiView"],
      productsApproved: ["FlowRunner", "Mobi Studio", "MobiConstructor", "Industrial Validation", "MobiView"],
      errors: 0,
    });
    expect(result.artifacts.flow.success).toBe(true);
    expect(result.artifacts.industrialValidation.certified).toBe(true);
  });

  it("fails when any step fails and keeps a single summary", () => {
    const result = new EndToEndRunner().execute({ project: "{invalid-json" });

    expect(result.success).toBe(false);
    expect(result.summary).toMatchObject({
      projectId: null,
      status: "FAILED",
      finalResult: "FAILED",
    });
    expect(result.summary.errors).toBeGreaterThan(0);
    expect(result.artifacts.flow.errors[0]?.code).toBeTruthy();
  });

  it("consolidates execution metrics", () => {
    let time = 0;
    const result = new EndToEndRunner(
      new FlowRunner(),
      undefined,
      undefined,
      () => {
        time += 5;
        return time;
      },
    ).execute({ project: project() });

    expect(result.summary.metrics).toMatchObject({
      loadMs: expect.any(Number),
      validationMs: expect.any(Number),
      studioMs: expect.any(Number),
      constructorMs: expect.any(Number),
      industrialValidationMs: 5,
      mobiViewMs: expect.any(Number),
      successPercent: 100,
    });
    expect(result.summary.totalDurationMs).toBeGreaterThanOrEqual(result.summary.metrics.totalMs);
  });

  it("consolidates evidence for every approved step", () => {
    const result = new EndToEndRunner().execute({ project: project() });

    expect(result.summary.evidence.map((item) => item.code)).toEqual([
      "PROJECT_LOADED",
      "SCHEMA_VALIDATED",
      "STUDIO_STARTED",
      "CONSTRUCTOR_EXECUTED",
      "SNAPSHOT_PRODUCED",
      "MOBI_VIEW_EXECUTED",
      "SNAPSHOT_CERTIFIED",
      "FLOW_CLOSED",
    ]);
  });

  it("consolidates all in-memory artifacts", () => {
    const result = new EndToEndRunner().execute({ project: project() });

    expect(result.artifacts).toMatchObject({
      flow: { status: "APPROVED" },
      industrialValidation: { status: "CERTIFIED" },
      report: { generatedAt: expect.any(String) },
      evidence: expect.any(Array),
      metrics: { successPercent: 100 },
    });
    expect(result.artifacts.report.summary).toEqual(result.summary);
  });

  it("produces a final report with warnings and diagnostics", () => {
    const result = new EndToEndRunner().execute({ project: project() });

    expect(result.artifacts.report.summary.warnings).toBeGreaterThanOrEqual(0);
    expect(result.artifacts.report.summary.diagnostics).toEqual(result.artifacts.industrialValidation.diagnostics);
    expect(result.artifacts.report.summary.durationsByStep).toHaveProperty("INDUSTRIAL_VALIDATION");
  });

  it("keeps cleanup evidence after flow errors", () => {
    const flow = new FlowRunner().execute({ project: "{bad-json" });
    const failingFlow = { execute: () => flow };
    const result = new EndToEndRunner(failingFlow).execute({ project: project() });

    expect(result.success).toBe(false);
    expect(result.artifacts.flow.timings.at(-1)?.step).toBe("CLEANUP");
    expect(result.summary.evidence.at(-1)?.code).toBe("FLOW_CLOSED");
  });

  it("rejects when industrial validation fails", () => {
    const rejected: IndustrialValidationResult = {
      certified: false,
      status: "REJECTED",
      diagnostics: [{ stage: "CAM", severity: "error", code: "CAM_INVALID", message: "Invalid CAM" }],
      summary: { projectId: ids.project, certified: false, manifestParts: 1, bomLines: 1, camPaths: 0, camOperations: 0, feedbackEvents: 0 },
    };
    const result = new EndToEndRunner(undefined, { validate: () => rejected } as never).execute({ project: project() });

    expect(result.success).toBe(false);
    expect(result.summary.errors).toBe(1);
    expect(result.summary.productsApproved).toEqual([]);
  });

  it("keeps CP005 imports on public checkpoint and product entrypoints", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
    const source = typescriptFiles(root).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/mobi-constructor\/src\/(?!index)/);
    expect(source).not.toMatch(/mobi-view\/src\/(?!index)/);
    expect(source).not.toMatch(/mobi-studio\/src\/(?!index)/);
    expect(source).not.toMatch(/\/(adapters|bom-manager|cam-bridge|closed-loop|feedback-loop|industrial|nesting-engine|part-generator|pipeline|verification-engine)\//);
  });
});

function typescriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? typescriptFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}
