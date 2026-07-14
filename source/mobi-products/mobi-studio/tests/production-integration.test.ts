import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  BOMViewerController,
  CAMSelectionBridge,
  CAMVisualizerConsumer,
  CAMVisualizerController,
  MIC_VERSION,
  ProductionDashboardController,
  ProductionIntegrationController,
  SceneGraph,
  SelectionController,
  TelemetryMonitorController,
  type IndustrialContractSnapshot,
  type NeutralCAMPackage,
  type ProductionFeedbackEvent,
  type ProductionFeedbackStream,
  type ProductionIntegrationRenderer,
} from "../src/index";
import { environmentInput, ids, moduleInput, partInput, ProjectBuilder, projectInput } from "./fixtures";

function cam(entityId = ids.part): NeutralCAMPackage {
  return {
    contract: "mobi.neutral-cam-package",
    version: MIC_VERSION,
    projectId: ids.project,
    sourceContractVersion: "1.0.0",
    layers: ["CUT_OUTLINE"],
    paths: [{
      id: "path-1",
      partId: ids.part,
      sheetId: "sheet-1",
      entityId,
      layer: "CUT_OUTLINE",
      closed: true,
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 20 }, { x: 0, y: 20 }, { x: 0, y: 0 }],
      bounds: { minX: 0, minY: 0, maxX: 10, maxY: 20 },
    }],
    operations: [{
      id: "operation-1",
      partId: ids.part,
      entityId,
      kind: "PROFILE",
      pathId: "path-1",
      parameters: { depth: 15 },
    }],
    bounds: { minX: 0, minY: 0, maxX: 10, maxY: 20 },
  };
}

const feedbackEvent: ProductionFeedbackEvent = {
  contract: "mobi.production-feedback-event",
  version: MIC_VERSION,
  eventId: "event-1",
  projectId: ids.project,
  partId: ids.part,
  logicalTimestamp: 1,
  status: "COMPLETED",
};

class FeedbackStream implements ProductionFeedbackStream {
  private readonly listeners = new Set<(event: ProductionFeedbackEvent) => void>();
  constructor(private readonly events: ProductionFeedbackEvent[] = [feedbackEvent]) {}
  snapshot(): readonly ProductionFeedbackEvent[] { return structuredClone(this.events); }
  subscribe(listener: (event: ProductionFeedbackEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  publish(event: ProductionFeedbackEvent): void {
    this.events.push(structuredClone(event));
    for (const listener of this.listeners) listener(structuredClone(event));
  }
  subscriberCount(): number { return this.listeners.size; }
}

function industrialSnapshot(stream = new FeedbackStream()): IndustrialContractSnapshot {
  return {
    manifest: {
      contract: "mobi.production-manifest",
      version: MIC_VERSION,
      projectId: ids.project,
      exportId: "export-1",
      state: "COMPLETED",
      progress: 100,
      indicators: { partCount: 1, hardwareCount: 0, operationCount: 1 },
      parts: [{ partId: ids.part, manufacturingId: "manufacturing-1", sourceEntityId: ids.part, status: "COMPLETED" }],
    },
    bom: {
      contract: "mobi.bom-output",
      version: MIC_VERSION,
      projectId: ids.project,
      lines: [{ id: "bom-1", kind: "MATERIAL", key: "MDF-15", quantity: 1, areaMm2: 200, volumeMm3: 3000, sourceEntityIds: [ids.part] }],
      totals: { partCount: 1, hardwareCount: 0, areaMm2: 200, volumeMm3: 3000 },
      groupingKeys: ["MATERIAL:MDF-15"],
    },
    cam: cam(),
    feedback: stream,
    transactions: { record: vi.fn(() => ({ success: true, transactionId: "tx-1" })) },
  };
}

function selectionController(): SelectionController {
  const project = new ProjectBuilder().createProject(projectInput).addEnvironment(environmentInput).addModule(ids.environment, moduleInput).addPart(ids.module, partInput).build();
  const scene = new SceneGraph();
  scene.build(project);
  return new SelectionController(scene);
}

describe("CP002-D CAM Visualizer", () => {
  it("renders only public Neutral CAM layers, paths, operations and bounds", () => {
    const view = new CAMVisualizerController().connect(cam());
    expect(view).toMatchObject({
      component: "CAM_VISUALIZER",
      hasData: true,
      projectId: ids.project,
      version: MIC_VERSION,
      sourceContractVersion: "1.0.0",
      bounds: cam().bounds,
    });
    expect(view.paths).toEqual(cam().paths);
    expect(view.operations).toEqual(cam().operations);
  });

  it("controls visibility and returns contract bounds without recalculating geometry", () => {
    const controller = new CAMVisualizerController();
    controller.connect(cam());
    expect(controller.focusBounds()).toEqual(cam().bounds);
    expect(controller.focusBounds("operation-1")).toEqual(cam().paths[0]!.bounds);
    expect(controller.inspectOperation("operation-1")).toEqual(cam().operations[0]);
    expect(controller.inspectOperation("missing")).toBeNull();
    expect(controller.setLayerVisibility("CUT_OUTLINE", false)).toMatchObject({ paths: [], operations: [] });
    expect(controller.setLayerVisibility("CUT_OUTLINE", true).paths).toHaveLength(1);
    expect(() => controller.setLayerVisibility("MISSING", true)).toThrow("CAM_LAYER_NOT_FOUND");
  });

  it("synchronizes operation entityId with SelectionController and rejects invisible entities", () => {
    const selection = selectionController();
    const controller = new CAMVisualizerController(undefined, new CAMSelectionBridge(selection));
    controller.connect(cam());
    expect(controller.selectOperation("operation-1")).toEqual({ success: true, entityId: ids.part });
    expect(controller.render().selectedOperation?.id).toBe("operation-1");
    expect(selection.get().entityId).toBe(ids.part);
    expect(controller.getState().selectedOperationId).toBe("operation-1");
    expect(controller.selectOperation("missing")).toEqual({ success: false, code: "CAM_ENTITY_NOT_VISIBLE" });

    const invisible = new CAMVisualizerController(undefined, new CAMSelectionBridge(selection));
    invisible.connect(cam("invisible"));
    expect(invisible.selectOperation("operation-1")).toEqual({ success: false, code: "CAM_ENTITY_NOT_VISIBLE" });
    controller.disconnect();
    expect(selection.get().entityId).toBeNull();

    const unexpected = new CAMSelectionBridge({
      select: () => { throw new Error("UNEXPECTED_CAM_SELECTION_FAILURE"); },
      clear: () => ({ entityId: null, highlightedMeshId: null }),
    } as unknown as SelectionController);
    expect(() => unexpected.select(cam().operations[0]!)).toThrow("UNEXPECTED_CAM_SELECTION_FAILURE");
    const consumer = new CAMVisualizerConsumer();
    consumer.consume(cam());
    expect(() => consumer.selectOperation("missing")).toThrow("CAM_OPERATION_NOT_FOUND");
  });

  it("disconnects and renders a minimal no-data CAM component", () => {
    const renderer = { render: vi.fn() };
    const controller = new CAMVisualizerController(undefined, undefined, renderer);
    expect(controller.render()).toMatchObject({ hasData: false, paths: [], operations: [] });
    controller.connect(cam());
    expect(controller.update(null)).toMatchObject({ hasData: false });
    controller.connect(cam());
    expect(controller.disconnect()).toMatchObject({ hasData: false, bounds: null });
    expect(renderer.render).toHaveBeenCalled();
  });
});

describe("CP002-E Telemetry Monitor", () => {
  it("loads history, subscribes to live events and unsubscribes on disconnect", () => {
    const stream = new FeedbackStream();
    const controller = new TelemetryMonitorController();
    expect(controller.connect(stream).events).toEqual([feedbackEvent]);
    expect(stream.subscriberCount()).toBe(1);
    stream.publish({ ...feedbackEvent, eventId: "event-2", logicalTimestamp: 2, status: "STARTED" });
    expect(controller.render().events.map((event) => event.eventId)).toEqual(["event-1", "event-2"]);
    expect(controller.disconnect()).toMatchObject({ connected: false, events: [] });
    expect(stream.subscriberCount()).toBe(0);
  });

  it("filters history by PartID, status, metric and telemetry presence", () => {
    const telemetry: ProductionFeedbackEvent = { ...feedbackEvent, eventId: "telemetry-1", logicalTimestamp: 3, status: "TELEMETRY", telemetry: { metric: "temperature", value: 22, unit: "C" } };
    const controller = new TelemetryMonitorController();
    controller.connect(new FeedbackStream([feedbackEvent, telemetry, { ...feedbackEvent, eventId: "other", partId: "part-2" }]));
    expect(controller.render({ partIds: [ids.part] }).events).toHaveLength(2);
    expect(controller.render({ statuses: ["COMPLETED"] }).events).toHaveLength(2);
    expect(controller.render({ telemetryOnly: true }).events).toEqual([telemetry]);
    expect(controller.render({ metric: "TEMP" }).events).toEqual([telemetry]);
  });

  it("enforces telemetry lifecycle and keeps rendering read-only", () => {
    const renderer = { render: vi.fn() };
    const controller = new TelemetryMonitorController(undefined, undefined, renderer);
    const stream = new FeedbackStream();
    expect(controller.render()).toMatchObject({ connected: false, events: [] });
    controller.connect(stream);
    expect(controller.getState().status).toBe("CONNECTED");
    expect(() => controller.connect(stream)).toThrow("TELEMETRY_MONITOR_CONNECTED");
    controller.disconnect();
    expect(() => controller.disconnect()).toThrow("TELEMETRY_MONITOR_DISCONNECTED");
    expect(renderer.render).toHaveBeenCalled();
  });
});

describe("CP002-F Production Integration ViewModel", () => {
  it("connects one public snapshot and composes all Phase 4 consumers", () => {
    const renderer: ProductionIntegrationRenderer = { render: vi.fn() };
    const controller = new ProductionIntegrationController(undefined, undefined, undefined, undefined, undefined, renderer);
    const view = controller.connect(industrialSnapshot());
    expect(view).toMatchObject({
      component: "PRODUCTION_INTEGRATION",
      connection: { connected: true, projectId: ids.project, micVersion: MIC_VERSION },
      dashboard: { hasData: true },
      bom: { hasData: true },
      cam: { hasData: true },
      telemetry: { connected: true },
    });
    expect(renderer.render).toHaveBeenCalled();
  });

  it("applies view-only filters and disconnects every consumer", () => {
    const stream = new FeedbackStream();
    const controller = new ProductionIntegrationController();
    controller.connect(industrialSnapshot(stream));
    expect(controller.render({ bom: { query: "MDF" }, telemetry: { statuses: ["COMPLETED"] } })).toMatchObject({ bom: { lines: [{ key: "MDF-15" }] }, telemetry: { events: [feedbackEvent] } });
    expect(controller.disconnect()).toMatchObject({
      connection: { connected: false },
      dashboard: { hasData: false },
      bom: { hasData: false },
      cam: { hasData: false },
      telemetry: { connected: false },
    });
    expect(stream.subscriberCount()).toBe(0);
  });

  it("rejects an incompatible MIC snapshot before connecting consumers", () => {
    const snapshot = industrialSnapshot();
    const incompatible = { ...snapshot, manifest: { ...snapshot.manifest, version: "2.0.0" } } as unknown as IndustrialContractSnapshot;
    const controller = new ProductionIntegrationController();
    expect(() => controller.connect(incompatible)).toThrow("MIC_VERSION_INCOMPATIBLE");
    expect(controller.render().connection.connected).toBe(false);
  });

  it("rolls back every connected consumer when composition fails", () => {
    let connected = false;
    const telemetry = {
      connect: () => { connected = true; throw new Error("TELEMETRY_CONNECT_FAILURE"); },
      disconnect: () => { connected = false; return { component: "TELEMETRY_MONITOR", connected: false, events: [] }; },
      getState: () => ({ status: connected ? "CONNECTED" : "DISCONNECTED", eventSequence: 0, events: [] }),
      render: () => ({ component: "TELEMETRY_MONITOR", connected, events: [] }),
    } as unknown as TelemetryMonitorController;
    const controller = new ProductionIntegrationController(
      undefined,
      new ProductionDashboardController(),
      new BOMViewerController(),
      new CAMVisualizerController(),
      telemetry,
    );
    expect(() => controller.connect(industrialSnapshot())).toThrow("TELEMETRY_CONNECT_FAILURE");
    expect(connected).toBe(false);
    expect(controller.render()).toMatchObject({
      connection: { connected: false },
      dashboard: { hasData: false },
      bom: { hasData: false },
      cam: { hasData: false },
      telemetry: { connected: false },
    });
  });

  it("keeps D-F imports on public MIC types and local Studio components", () => {
    const base = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
    const roots = ["cam-visualizer", "telemetry-monitor", "production-integration"];
    const source = roots.flatMap((root) => typescriptFiles(join(base, root))).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toContain("mobi-constructor/");
    expect(source).not.toMatch(/\/(pipelines?|providers?|managers?|builders?|engines?|public-industrial-contracts)\//i);
    expect(source).not.toMatch(/\b(BOMManager|CAMBridge|FeedbackLoop|NestingEngine|PartGenerator)\b/);
  });
});

function typescriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? typescriptFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}
