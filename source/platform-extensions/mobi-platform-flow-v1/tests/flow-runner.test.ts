import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
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
import { MobiViewIntegration } from "../../../mobi-products/mobi-view/src/index";
import { FlowLogger, FlowRunner, type FlowStepName } from "../src/index";

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

function runner(times: number[] = Array.from({ length: 40 }, (_, index) => index * 10)) {
  return new FlowRunner(undefined, undefined, new FlowLogger(() => times.shift() ?? 999));
}

describe("CP003 FlowRunner", () => {
  it("executes a real Projeto.mobi through Studio, Constructor and MobiView", () => {
    const result = runner().execute({ project: project(), sessionId: "cp003-valid" });

    expect(result).toMatchObject({
      success: true,
      status: "APPROVED",
      projectId: ids.project,
      viewSnapshot: {
        projectId: ids.project,
        production: { state: "COMPLETED", progress: 100, partCount: 1 },
        bomRows: 2,
        cam: { layers: ["CUT_OUTLINE"], paths: 1, operations: 2 },
      },
    });
    expect(result.industrialSnapshot?.manifest.projectId).toBe(ids.project);
    expect(result.report.evidence).toEqual(expect.arrayContaining([
      `Projeto.mobi loaded: ${ids.project}`,
      "MobiConstructor public flow executed",
      "MobiView return validated",
    ]));
  });

  it("accepts a serialized Projeto.mobi and produces a final report", () => {
    const result = runner().execute({ project: JSON.stringify(project()), sessionId: "cp003-report" });

    expect(result.success).toBe(true);
    expect(result.report).toMatchObject({
      status: "APPROVED",
      projectId: ids.project,
      sessionId: "cp003-report",
    });
    expect(result.report.steps.map((step) => step.step)).toEqual([
      "LOAD_PROJECT",
      "VALIDATE_SCHEMA",
      "OPEN_STUDIO",
      "RUN_CONSTRUCTOR",
      "GENERATE_SNAPSHOT",
      "DELIVER_MOBI_VIEW",
      "VALIDATE_VIEW",
      "CLEANUP",
    ]);
  });

  it("records deterministic step timings", () => {
    const result = runner([0, 5, 10, 25, 30, 60, 70, 90, 100, 130, 140, 145, 150, 180, 190, 195]).execute({ project: project() });

    expect(result.success).toBe(true);
    expect(result.timings.map((step) => [step.step, step.durationMs])).toEqual([
      ["LOAD_PROJECT", 5],
      ["VALIDATE_SCHEMA", 15],
      ["OPEN_STUDIO", 30],
      ["RUN_CONSTRUCTOR", 20],
      ["GENERATE_SNAPSHOT", 30],
      ["DELIVER_MOBI_VIEW", 5],
      ["VALIDATE_VIEW", 30],
      ["CLEANUP", 5],
    ]);
    expect(result.report.totalDurationMs).toBe(140);
  });

  it("fails invalid Projeto.mobi input without opening downstream products", () => {
    const result = runner().execute({ project: "{invalid-json" });

    expect(result).toMatchObject({
      success: false,
      status: "FAILED",
      projectId: null,
      errors: [{ step: "VALIDATE_SCHEMA", code: expect.any(String) }],
    });
    expect(result.timings.map((step) => step.step)).toEqual(["LOAD_PROJECT", "CLEANUP"]);
  });

  it("reports schema validation failures", () => {
    const invalid = { ...project(), id: "" };
    const result = runner().execute({ project: invalid });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatchObject({ step: "VALIDATE_SCHEMA", code: "SCHEMA_ERROR" });
  });

  it("reports Studio opening failures and runs cleanup", () => {
    const result = new FlowRunner(undefined, undefined, new FlowLogger(), {
      createStudio: () => {
        throw new Error("STUDIO_OPEN_FAILED");
      },
    }).execute({ project: project() });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatchObject({ step: "OPEN_STUDIO", code: "STUDIO_OPEN_FAILED" });
    expect(result.timings.at(-1)?.step).toBe("CLEANUP");
  });

  it("reports Constructor failures", () => {
    const result = new FlowRunner(undefined, undefined, new FlowLogger(), {
      createConstructorFlow: () => ({
        execute: () => {
          throw new Error("CONSTRUCTOR_FLOW_FAILED");
        },
      } as never),
    }).execute({ project: project() });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatchObject({ step: "RUN_CONSTRUCTOR", code: "CONSTRUCTOR_FLOW_FAILED" });
  });

  it("reports invalid industrial snapshots", () => {
    const result = new FlowRunner(undefined, undefined, new FlowLogger(), {
      createConstructorFlow: () => ({
        execute: () => {
          const ok = runner().execute({ project: project() }).industrialSnapshot!;
          return { ...ok, bom: { ...ok.bom, projectId: "other" } };
        },
      } as never),
    }).execute({ project: project() });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatchObject({
      step: "GENERATE_SNAPSHOT",
      code: "FLOW_INDUSTRIAL_SNAPSHOT_PROJECT_MISMATCH",
    });
  });

  it("reports MobiView failures", () => {
    class FailingView extends MobiViewIntegration {
      override connect(): never {
        throw new Error("MOBI_VIEW_FAILED");
      }
    }
    const result = new FlowRunner(undefined, undefined, new FlowLogger(), {
      createView: () => new FailingView(),
    }).execute({ project: project() });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatchObject({ step: "DELIVER_MOBI_VIEW", code: "MOBI_VIEW_FAILED" });
  });

  it("disconnects MobiView and stops Studio after errors", () => {
    const disconnect = vi.fn(() => true);
    const stop = vi.fn();
    const result = new FlowRunner(undefined, undefined, new FlowLogger(), {
      createStudio: () => ({
        start: vi.fn(),
        stop,
        getState: () => ({ sceneNodes: 1 }),
      } as never),
      createView: () => ({
        connect: () => {
          throw new Error("MOBI_VIEW_FAILED");
        },
        disconnect,
      } as never),
    }).execute({ project: project() });

    expect(result.success).toBe(false);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("keeps CP003 imports on public product entrypoints", () => {
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
