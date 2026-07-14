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
import type { EndToEndExecutionResult } from "../../mobi-platform-end-to-end-v1/src/index";
import { FlowRunner, type FlowProjectInput } from "../../mobi-platform-flow-v1/src/index";
import { RealProjectRunner, type ExecutionScenario } from "../src/index";

function realProject() {
  return new ProjectBuilder()
    .createProject({ ...projectInput, displayName: "CP006 Real Kitchen" })
    .addEnvironment({ ...environmentInput, displayName: "Real Kitchen" })
    .addArchitecture(ids.environment, architectureInput)
    .addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput)
    .build();
}

function scenario(project: FlowProjectInput = realProject()): ExecutionScenario {
  return {
    id: "cp006-real-project",
    name: "CP006 Real Project Execution",
    project,
    expectation: {
      projectId: ids.project,
      minimumSuccessPercent: 100,
      maxTotalDurationMs: 10000,
    },
  };
}

describe("CP006 Real Project Execution", () => {
  it("executes a real Projeto.mobi using only the platform chain", () => {
    const result = new RealProjectRunner().execute(scenario());

    expect(result.approved).toBe(true);
    expect(result.execution.summary).toMatchObject({
      projectId: ids.project,
      status: "APPROVED",
      finalResult: "SUCCESS",
    });
    expect(result.checklist.every((item) => item.passed)).toBe(true);
  });

  it("validates the execution checklist", () => {
    const result = new RealProjectRunner().execute(scenario());

    expect(result.checklist.map((item) => item.code)).toEqual([
      "PROJECT_LOADED",
      "SCHEMA_VALID",
      "STUDIO_STARTED",
      "CONSTRUCTOR_EXECUTED",
      "INDUSTRIAL_SNAPSHOT",
      "SNAPSHOT_CERTIFIED",
      "VIEWER_LOADED",
      "FINAL_SUMMARY",
    ]);
  });

  it("classifies blockers, errors, warnings, improvements and bottlenecks", () => {
    const invalid = new RealProjectRunner().execute(scenario("{invalid-json"));

    expect(invalid.approved).toBe(false);
    expect(invalid.diagnostics.blockers).toContain("REAL_PROJECT_EXECUTION_NOT_APPROVED");
    expect(invalid.diagnostics.errors.length).toBeGreaterThan(0);
    expect(invalid.humanValidationReport.approved).toBe(false);
  });

  it("detects expectation mismatches", () => {
    const result = new RealProjectRunner().execute({
      ...scenario(),
      expectation: { projectId: "other-project", minimumSuccessPercent: 100, maxTotalDurationMs: 0 },
    });

    expect(result.approved).toBe(false);
    expect(result.diagnostics.blockers).toContain("EXPECTED_PROJECT_ID_MISMATCH");
    expect(result.diagnostics.warnings).toContain("TOTAL_DURATION_ABOVE_EXPECTATION");
  });

  it("produces a human validation report and script for Charles", () => {
    const result = new RealProjectRunner().execute(scenario());

    expect(result.humanValidationReport).toMatchObject({
      scenarioId: "cp006-real-project",
      scenarioName: "CP006 Real Project Execution",
      projectId: ids.project,
      approved: true,
    });
    expect(result.humanValidationReport.script.map((step) => step.action)).toEqual([
      "Abrir o Projeto.mobi real no cenário CP006.",
      "Executar o RealProjectRunner.",
      "Comparar ExecutionSummary esperado e obtido.",
      "Validar evidências por etapa.",
      "Validar visualmente o resultado no MobiView.",
      "Registrar aprovação final de Charles.",
    ]);
  });

  it("rejects invalid scenarios before execution", () => {
    expect(() => new RealProjectRunner().execute({ ...scenario(), id: "" })).toThrow("SCENARIO_ID_REQUIRED");
    expect(() => new RealProjectRunner().execute({ ...scenario(), name: "" })).toThrow("SCENARIO_NAME_REQUIRED");
  });

  it("can consume a mocked end-to-end result for failure diagnostics", () => {
    const flow = new FlowRunner().execute({ project: "{invalid-json" });
    const execution: EndToEndExecutionResult = {
      success: false,
      summary: {
        projectId: ids.project,
        status: "FAILED",
        totalDurationMs: 10,
        durationsByStep: { LOAD_PROJECT: 1, INDUSTRIAL_VALIDATION: 9 },
        productsExecuted: ["FlowRunner"],
        productsApproved: [],
        diagnostics: [{ stage: "CAM", severity: "error", code: "CAM_INVALID", message: "Invalid CAM" }],
        warnings: 0,
        errors: 1,
        finalResult: "FAILED",
        evidence: [],
        metrics: { loadMs: 1, validationMs: 0, studioMs: 0, constructorMs: 0, industrialValidationMs: 9, mobiViewMs: 0, totalMs: 10, successPercent: 20 },
      },
      artifacts: {
        flow,
        industrialValidation: {
          certified: false,
          status: "REJECTED",
          diagnostics: [{ stage: "CAM", severity: "error", code: "CAM_INVALID", message: "Invalid CAM" }],
          summary: { projectId: ids.project, certified: false, manifestParts: 0, bomLines: 0, camPaths: 0, camOperations: 0, feedbackEvents: 0 },
        },
        report: { generatedAt: "2026-07-14T00:00:00.000Z", summary: {} as EndToEndExecutionResult["summary"] },
        evidence: [],
        metrics: { loadMs: 1, validationMs: 0, studioMs: 0, constructorMs: 0, industrialValidationMs: 9, mobiViewMs: 0, totalMs: 10, successPercent: 20 },
      },
    };
    const result = new RealProjectRunner({ execute: () => execution } as never).execute(scenario());

    expect(result.approved).toBe(false);
    expect(result.diagnostics.errors).toContain("CAM_INVALID");
    expect(result.humanValidationReport.approved).toBe(false);
  });

  it("keeps CP006 imports on public checkpoint entrypoints", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
    const source = typescriptFiles(root).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/mobi-constructor\/src\//);
    expect(source).not.toMatch(/mobi-view\/src\//);
    expect(source).not.toMatch(/mobi-studio\/src\//);
    expect(source).not.toMatch(/\/(adapters|bom-manager|cam-bridge|closed-loop|feedback-loop|industrial|nesting-engine|part-generator|pipeline|verification-engine)\//);
  });
});

function typescriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? typescriptFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}
