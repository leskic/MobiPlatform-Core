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
import type { EndToEndExecutionResult } from "../../../platform-extensions/mobi-platform-end-to-end-v1/src/index";
import { FlowRunner } from "../../../platform-extensions/mobi-platform-flow-v1/src/index";
import { RealProjectRunner, type ExecutionScenario, type RealProjectExecutionResult } from "../../../platform-extensions/mobi-platform-real-project-v1/src/index";
import { App } from "../src/App";
import { ExecutionController } from "../src/ExecutionController";
import type { ExecutionViewModel } from "../src/ExecutionViewModel";
import { ProjectFileLoader, type LoadedProject } from "../src/ProjectFileLoader";
import { ExecutionDiagnosticsView } from "../src/ui/ExecutionDiagnosticsView";
import { ExecutionEvidenceView } from "../src/ui/ExecutionEvidenceView";
import { ExecutionStatusView } from "../src/ui/ExecutionStatusView";
import { StudioShellView } from "../src/ui/StudioShellView";

function realProjectJson(): string {
  const project = new ProjectBuilder()
    .createProject({ ...projectInput, displayName: "CP007 Browser Kitchen" })
    .addEnvironment({ ...environmentInput, displayName: "Browser Kitchen" })
    .addArchitecture(ids.environment, architectureInput)
    .addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput)
    .build();
  return JSON.stringify(project);
}

function loadedProject(): LoadedProject {
  const result = new ProjectFileLoader().loadText(realProjectJson(), "real-project.mobi");
  if (!result.success) throw new Error(result.message);
  return result.project;
}

function realExecution(): RealProjectExecutionResult {
  return new RealProjectRunner().execute({
    id: "cp007-test",
    name: "CP007 Host Test",
    project: realProjectJson(),
    expectation: { projectId: ids.project, minimumSuccessPercent: 100 },
  });
}

function rejectedExecution(code: string, message: string): RealProjectExecutionResult {
  const flow = new FlowRunner().execute({ project: "{invalid-json" });
  const execution: EndToEndExecutionResult = {
    success: false,
    summary: {
      projectId: ids.project,
      status: "FAILED",
      totalDurationMs: 12,
      durationsByStep: { LOAD_PROJECT: 2, RUN_CONSTRUCTOR: 4, INDUSTRIAL_VALIDATION: 6 },
      productsExecuted: ["FlowRunner", "MobiConstructor", "Industrial Validation"],
      productsApproved: [],
      diagnostics: [{ stage: "CAM", severity: "error", code, message }],
      warnings: 0,
      errors: 1,
      finalResult: "FAILED",
      evidence: [{ code: "PROJECT_LOADED", message: "Projeto.mobi loaded" }],
      metrics: { loadMs: 2, validationMs: 0, studioMs: 0, constructorMs: 4, industrialValidationMs: 6, mobiViewMs: 0, totalMs: 12, successPercent: 40 },
    },
    artifacts: {
      flow,
      industrialValidation: {
        certified: false,
        status: "REJECTED",
        diagnostics: [{ stage: "CAM", severity: "error", code, message }],
        summary: { projectId: ids.project, certified: false, manifestParts: 0, bomLines: 0, camPaths: 0, camOperations: 0, feedbackEvents: 0 },
      },
      report: { generatedAt: "2026-07-14T00:00:00.000Z", summary: {} as EndToEndExecutionResult["summary"] },
      evidence: [{ code: "PROJECT_LOADED", message: "Projeto.mobi loaded" }],
      metrics: { loadMs: 2, validationMs: 0, studioMs: 0, constructorMs: 4, industrialValidationMs: 6, mobiViewMs: 0, totalMs: 12, successPercent: 40 },
    },
  };

  return new RealProjectRunner({ execute: () => execution } as never).execute({
    id: "cp007-rejected",
    name: "CP007 Rejected",
    project: realProjectJson(),
    expectation: { projectId: ids.project, minimumSuccessPercent: 100 },
  });
}

function rootElement(): HTMLElement {
  return {
    innerHTML: "",
    querySelector: () => null,
  } as unknown as HTMLElement;
}

describe("CP007 Executable Mobi Studio", () => {
  it("initializes the application shell", () => {
    const root = rootElement();
    const app = new App(root);
    app.mount();

    expect(root.innerHTML).toContain("Mobi Studio");
    expect(root.innerHTML).toContain("Abrir Projeto.mobi");
    expect(root.innerHTML).toContain("Executar Fluxo");
    expect(app.snapshot().status).toBe("idle");
  });

  it("loads a valid Projeto.mobi file", () => {
    const result = new ProjectFileLoader().loadText(realProjectJson(), "valid.mobi");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.project.projectId).toBe(ids.project);
      expect(result.project.projectName).toBe("CP007 Browser Kitchen");
    }
  });

  it("rejects an invalid file", () => {
    const result = new ProjectFileLoader().loadText("{invalid-json", "invalid.mobi");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe("JSON_SYNTAX_ERROR");
  });

  it("reports schema validation errors", () => {
    const invalid = JSON.stringify({ ...JSON.parse(realProjectJson()), id: "" });
    const result = new ProjectFileLoader().loadText(invalid, "schema-error.mobi");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe("SCHEMA_ERROR");
  });

  it("executes the complete integrated flow", () => {
    const result = new ExecutionController().execute(loadedProject());

    expect(result.success).toBe(true);
    expect(result.viewModel?.status).toBe("APPROVED");
    expect(result.viewModel?.productsExecuted).toEqual([
      "FlowRunner",
      "Mobi Studio",
      "MobiConstructor",
      "Industrial Validation",
      "MobiView",
    ]);
  });

  it("surfaces Constructor errors", () => {
    const result = new ExecutionController({ execute: () => rejectedExecution("CONSTRUCTOR_FAILED", "Constructor rejected the flow") }).execute(loadedProject());

    expect(result.success).toBe(false);
    expect(result.viewModel?.diagnostics.map((item) => item.code)).toContain("CONSTRUCTOR_FAILED");
  });

  it("surfaces rejected industrial snapshots", () => {
    const result = new ExecutionController({ execute: () => rejectedExecution("SNAPSHOT_REJECTED", "Industrial snapshot rejected") }).execute(loadedProject());

    expect(result.success).toBe(false);
    expect(result.viewModel?.status).toBe("FAILED");
    expect(result.viewModel?.diagnosticGroups.blockers).toContain("REAL_PROJECT_EXECUTION_NOT_APPROVED");
  });

  it("surfaces MobiView errors", () => {
    const result = new ExecutionController({ execute: () => rejectedExecution("MOBI_VIEW_FAILED", "MobiView could not load snapshot") }).execute(loadedProject());

    expect(result.success).toBe(false);
    expect(result.viewModel?.diagnostics.map((item) => item.code)).toContain("MOBI_VIEW_FAILED");
  });

  it("updates visual status from the execution state", () => {
    const execution = new ExecutionController({ execute: () => realExecution() }).execute(loadedProject()).viewModel as ExecutionViewModel;
    const html = new ExecutionStatusView().render({
      status: "approved",
      project: loadedProject(),
      execution,
      message: "Fluxo aprovado.",
    });

    expect(html).toContain("approved");
    expect(html).toContain("Duracao total");
    expect(html).toContain("FlowRunner");
  });

  it("displays execution evidence", () => {
    const execution = new ExecutionController({ execute: () => realExecution() }).execute(loadedProject()).viewModel as ExecutionViewModel;
    const html = new ExecutionEvidenceView().render({
      status: "approved",
      project: loadedProject(),
      execution,
      message: null,
    });

    expect(html).toContain("PROJECT_LOADED");
    expect(html).toContain("MOBI_VIEW_EXECUTED");
  });

  it("displays diagnostics and the final report", () => {
    const execution = new ExecutionController({ execute: () => rejectedExecution("CAM_INVALID", "Invalid CAM") }).execute(loadedProject()).viewModel as ExecutionViewModel;
    const html = new ExecutionDiagnosticsView().render({
      status: "rejected",
      project: loadedProject(),
      execution,
      message: null,
    });

    expect(html).toContain("CAM_INVALID");
    expect(html).toContain("Relatorio Final");
    expect(html).toContain("FAILED");
  });

  it("cleans execution state after runtime errors", () => {
    const result = new ExecutionController({ execute: () => { throw new Error("CONSTRUCTOR_RUNTIME_ERROR"); } }).execute(loadedProject());

    expect(result.success).toBe(false);
    expect(result.viewModel).toBeNull();
    expect(result.error).toBe("CONSTRUCTOR_RUNTIME_ERROR");
  });

  it("renders the full shell with Viewer, evidence and diagnostics panels", () => {
    const execution = new ExecutionController({ execute: () => realExecution() }).execute(loadedProject()).viewModel as ExecutionViewModel;
    const html = new StudioShellView().render({
      status: "approved",
      project: loadedProject(),
      execution,
      message: "Fluxo aprovado.",
    });

    expect(html).toContain("MobiView");
    expect(html).toContain("Evidencias");
    expect(html).toContain("Diagnosticos");
    expect(html).toContain(ids.project);
  });

  it("keeps CP007 imports on public platform entrypoints", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
    const source = typescriptFiles(root).map((file) => readFileSync(file, "utf8")).join("\n");

    expect(source).not.toMatch(/mobi-constructor\/src\//);
    expect(source).not.toMatch(/mobi-view\/src\//);
    expect(source).not.toMatch(/mobi-products\/mobi-studio\/src\/(?!index)/);
    expect(source).not.toMatch(/\/(adapters|bom-manager|cam-bridge|closed-loop|feedback-loop|industrial|nesting-engine|part-generator|pipeline|verification-engine)\//);
  });
});

function typescriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? typescriptFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}
