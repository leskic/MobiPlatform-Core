import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { IndustrialExportTransaction } from "../src/adapters/IndustrialExportTransaction";
import { TraceabilityTransaction } from "../src/adapters/TraceabilityTransaction";
import { BOMManager } from "../src/bom-manager/BOMManager";
import { CAMBridge } from "../src/cam-bridge/CAMBridge";
import type {
  IndustrialLog,
  SheetSpecification,
  TelemetryRecord,
} from "../src/closed-loop/Phase3Types";
import { FeedbackLoop } from "../src/feedback-loop/FeedbackLoop";
import { NestingEngine } from "../src/nesting-engine/NestingEngine";
import { ConstructorIndustrialRuleSet } from "../src/part-generator/IndustrialRuleSet";
import { PartGenerator } from "../src/part-generator/PartGenerator";
import { ClosedLoopPipeline } from "../src/pipeline/ClosedLoopPipeline";
import { IndustrializationPipeline } from "../src/pipeline/IndustrializationPipeline";
import {
  ConstructorIndustrialProvider,
  MIC_VERSION,
  type PublicTransactionCommand,
  type ProductionFeedbackEvent,
} from "../src/index";
import { VerificationEngine } from "../src/verification-engine/VerificationEngine";
import {
  ProjectBuilder,
  environmentInput,
  ids,
  moduleInput,
  partInput,
  projectInput,
} from "./fixtures";

function project() {
  const value = new ProjectBuilder()
    .createProject(projectInput)
    .addEnvironment(environmentInput)
    .addModule(ids.environment, moduleInput)
    .addPart(ids.module, partInput)
    .build();
  const part = value.environments[0]!.modules[0]!.parts[0]!;
  const copy = {
    ...structuredClone(part),
    id: "22222222-2222-4222-8222-222222222222",
    size: { ...part.size, width: 500, height: 300 },
  };
  return {
    ...value,
    environments: value.environments.map((environment, environmentIndex) =>
      environmentIndex
        ? environment
        : {
            ...environment,
            modules: environment.modules.map((module, moduleIndex) =>
              moduleIndex ? module : { ...module, parts: [...module.parts, copy] },
            ),
          },
    ),
  };
}

function setup() {
  const value = project();
  const generator = new PartGenerator(new ConstructorIndustrialRuleSet());
  const bom = new BOMManager();
  const cam = new CAMBridge();
  const coordinator = {
    execute: vi.fn((_command: unknown) => ({ success: true, transactionId: "mic-tx" })),
  };
  const industrial = new IndustrializationPipeline(
    generator,
    { analyze: () => [] },
    bom,
    cam,
    { analyze: () => ({ status: "HEALTHY", diagnostics: [] }) },
    new IndustrialExportTransaction(coordinator),
  ).execute(value, 1);
  const manufacturing = generator.generate(value);
  const logs: IndustrialLog[] = manufacturing.parts.map((part, index) => ({
    id: `log-${index}`,
    partId: part.sourceProductId,
    timestamp: index,
    status: "COMPLETED",
    actual: { width: part.width, height: part.height, thickness: part.thickness },
  }));
  const telemetry: TelemetryRecord[] = [
    {
      id: "telemetry-1",
      partId: manufacturing.parts[0]!.sourceProductId,
      timestamp: 4,
      metric: "temperature",
      value: 22,
      unit: "C",
    },
  ];
  const specification: SheetSpecification = { width: 1500, height: 1000, margin: 10, kerf: 4 };
  const closedLoop = new ClosedLoopPipeline(
    generator,
    new NestingEngine(),
    bom,
    cam,
    new FeedbackLoop(),
    new VerificationEngine({ publish: vi.fn() }),
    new TraceabilityTransaction(coordinator),
  ).execute(value, specification, logs, telemetry);
  const provider = new ConstructorIndustrialProvider(coordinator);
  return { value, industrial, closedLoop, provider, coordinator };
}

describe("Mobi Industrial Contracts 1.1.0", () => {
  it("publishes versioned Production Manifest and public BOM Output", () => {
    const { industrial, closedLoop, provider } = setup();
    const output = provider.provide(industrial, closedLoop);
    expect(output.manifest).toMatchObject({
      contract: "mobi.production-manifest",
      version: MIC_VERSION,
      projectId: projectInput.id,
      exportId: industrial.exportTransactionId,
      state: "COMPLETED",
      progress: 100,
    });
    expect(output.manifest.parts).toHaveLength(2);
    expect(output.manifest.indicators).toMatchObject({ partCount: 2, hardwareCount: 0 });
    expect(output.bom).toMatchObject({
      contract: "mobi.bom-output",
      version: MIC_VERSION,
      projectId: projectInput.id,
    });
    expect(output.bom.lines.every((line) => line.id.startsWith("bom:"))).toBe(true);
    expect(output.bom.groupingKeys).toEqual([...output.bom.groupingKeys].sort());
  });

  it("publishes renderable Neutral CAM paths, operations, layers and bounds", () => {
    const { industrial, closedLoop, provider } = setup();
    const cam = provider.provide(industrial, closedLoop).cam;
    expect(cam).toMatchObject({
      contract: "mobi.neutral-cam-package",
      version: MIC_VERSION,
      sourceContractVersion: "1.0.0",
      layers: ["CUT_OUTLINE"],
    });
    expect(cam.paths).toHaveLength(closedLoop.nesting.placementCount);
    expect(cam.paths.every((path) => path.closed && path.points.length === 5)).toBe(true);
    expect(cam.operations.length).toBeGreaterThan(0);
    expect(cam.operations.every((operation) => operation.pathId.startsWith("cam:path:"))).toBe(true);
    expect(cam.bounds.maxX).toBeGreaterThan(cam.bounds.minX);
    expect(cam.bounds.maxY).toBeGreaterThan(cam.bounds.minY);
  });

  it("exposes a read-only feedback stream with deterministic history and live subscription", () => {
    const { industrial, closedLoop, provider } = setup();
    const stream = provider.provide(industrial, closedLoop).feedback;
    const before = stream.snapshot();
    expect(before.map((event) => event.logicalTimestamp)).toEqual(
      [...before].map((event) => event.logicalTimestamp).sort((a, b) => a - b),
    );
    const listener = vi.fn();
    const unsubscribe = stream.subscribe(listener);
    const event: ProductionFeedbackEvent = {
      contract: "mobi.production-feedback-event",
      version: MIC_VERSION,
      eventId: "live-1",
      projectId: projectInput.id,
      partId: industrial.manufacturing.parts[0]!.sourceProductId,
      logicalTimestamp: 10,
      status: "STARTED",
    };
    provider.publishFeedback(event);
    expect(listener).toHaveBeenCalledWith(event);
    expect(stream.snapshot().at(-1)).toEqual(event);
    unsubscribe();
    provider.publishFeedback({ ...event, eventId: "live-2", logicalTimestamp: 11 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("records only the three approved industrial transaction commands", () => {
    const { industrial, closedLoop, provider, coordinator } = setup();
    const port = provider.provide(industrial, closedLoop).transactions;
    for (const command of ["EXPORT_STARTED", "EXPORT_COMPLETED", "INDUSTRIAL_VIEWED"] as const) {
      expect(port.record(command, projectInput.id, `ref:${command}`)).toEqual({
        success: true,
        transactionId: "mic-tx",
      });
    }
    const calls = coordinator.execute.mock.calls
      .slice(-3)
      .map(([command]) => command as PublicTransactionCommand);
    expect(calls.map((command) => command.operationName)).toEqual([
      "EXPORT_STARTED",
      "EXPORT_COMPLETED",
      "INDUSTRIAL_VIEWED",
    ]);
    for (const command of calls) {
      command.operation({});
      command.preview.apply({});
      command.preview.revert({});
      expect(command.value.micVersion).toBe(MIC_VERSION);
    }
    expect(port.record("EXPORT_STARTED", "", "ref")).toEqual({
      success: false,
      errorCode: "INVALID_INDUSTRIAL_TRANSACTION",
    });
  });

  it("blocks inconsistent sources and malformed public feedback", () => {
    const { industrial, closedLoop, provider } = setup();
    expect(() =>
      provider.provide(
        industrial,
        { ...closedLoop, nesting: { ...closedLoop.nesting, projectId: "other" } },
      ),
    ).toThrow("MIC_PROJECT_MISMATCH");
    const missingNeutral = { ...closedLoop, cam: closedLoop.cam.filter((item) => item.format !== "NEUTRAL_CAM") };
    expect(() => provider.provide(industrial, missingNeutral)).toThrow("MIC_NEUTRAL_CAM_SOURCE_MISSING");
    provider.provide(industrial, closedLoop);
    expect(() =>
      provider.publishFeedback({
        contract: "mobi.production-feedback-event",
        version: MIC_VERSION,
        eventId: "bad",
        projectId: projectInput.id,
        partId: "unknown",
        logicalTimestamp: 0,
        status: "STARTED",
      }),
    ).toThrow("MIC_INVALID_FEEDBACK_EVENT");
  });

  it("exports only the public MIC surface through the Constructor entrypoint", () => {
    const entrypoint = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
    expect(entrypoint).toContain("public-industrial-contracts/MICContracts");
    expect(entrypoint).toContain("public-industrial-contracts/ConstructorIndustrialProvider");
    expect(entrypoint).not.toContain("industrial/IndustrialTypes");
    expect(entrypoint).not.toContain("closed-loop/Phase3Types");
  });
});
