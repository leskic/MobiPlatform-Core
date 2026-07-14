import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../builder/tests/fixture";
import type { Project } from "../../builder/types/ProjectTypes";
import { ProjectCodec } from "../../codec/ProjectCodec";
import { MobiOrigin } from "../../origin/MobiOrigin";
import { SyncEvent } from "../../sync/SyncEvent";
import { SyncManager } from "../../sync/SyncManager";
import type { DivergenceReportSnapshot } from "../../sync/interfaces/SyncTypes";
import { ConflictResolver } from "../ConflictResolver";
import { ResolutionContext } from "../ResolutionContext";
import type { ResolutionStrategy } from "../ResolutionStrategy";
import { SyncOrchestrator } from "../SyncOrchestrator";

function project(): Project {
  return new ProjectBuilder().createProject(projectInput).addEnvironment(environmentInput)
    .addArchitecture(ids.environment, architectureInput).addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput).addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput).build();
}

function setup() {
  const input = project();
  const origin = new MobiOrigin();
  origin.openProject(ProjectCodec.serialize(input));
  const manager = new SyncManager(origin);
  manager.createSession("sync-session");
  const orchestrator = new SyncOrchestrator(manager);
  return { input, origin, manager, orchestrator };
}

function report(manager: SyncManager): DivergenceReportSnapshot {
  return manager.detectDivergence(
    ids.part, "internal", "external", { width: 720 }, { width: 700 }, 10, "tx-001"
  );
}

describe("Mobi Sync Orchestrator Foundation", () => {
  it("creates, connects and consumes Sync Manager events", () => {
    const { manager, orchestrator } = setup();
    orchestrator.connect();
    orchestrator.connect();
    manager.receive(new SyncEvent("MODIFIED", ids.part, "tx-event", 9));
    expect(orchestrator.getEvents()).toEqual([{
      type: "SYNC_EVENT_RECEIVED", transactionId: "tx-event", entity: ids.part, logicalTimestamp: 9
    }]);
  });

  it.each<ResolutionStrategy>([
    "ACCEPT_INTERNAL", "ACCEPT_EXTERNAL", "REQUIRE_USER_CONFIRMATION", "IGNORE"
  ])("selects %s explicitly and prepares a request", (strategy) => {
    const { manager, orchestrator } = setup();
    const result = orchestrator.process(report(manager), strategy);
    expect(result.decision).toEqual({
      strategy, entity: ids.part, transactionId: "tx-001", requiresExecution: false
    });
    expect(result.request).toEqual(expect.objectContaining({
      id: "tx-001", entity: ids.part, source: "internal", destination: "external",
      strategy, status: "PREPARED", logicalTimestamp: 10
    }));
    expect(result.request.sourceFingerprint).not.toBe(result.request.destinationFingerprint);
  });

  it("records processing events in deterministic order", () => {
    const { manager, orchestrator } = setup();
    const result = orchestrator.process(report(manager), "REQUIRE_USER_CONFIRMATION");
    expect(result.events.map((event) => event.type)).toEqual([
      "DIVERGENCE_PROCESSED", "TRANSACTION_PREPARED"
    ]);
  });

  it("uses the last consumed Sync event only as context", () => {
    const { manager, orchestrator } = setup();
    orchestrator.connect();
    manager.receive(new SyncEvent("MODIFIED", ids.part, "tx-event", 9));
    const result = orchestrator.process(report(manager), "IGNORE");
    expect(result.events.map((event) => event.type)).toEqual([
      "SYNC_EVENT_RECEIVED", "DIVERGENCE_PROCESSED", "TRANSACTION_PREPARED"
    ]);
  });

  it("disconnects without creating a new observer", () => {
    const { manager, orchestrator } = setup();
    orchestrator.connect();
    orchestrator.disconnect();
    orchestrator.disconnect();
    manager.receive(new SyncEvent("OBSERVED", ids.project, "tx", 1));
    expect(orchestrator.getEvents()).toEqual([]);
  });

  it("isolates state between orchestrators and clears local state", () => {
    const { manager } = setup();
    const first = new SyncOrchestrator(manager);
    const second = new SyncOrchestrator(manager);
    first.process(report(manager), "IGNORE");
    expect(first.getEvents()).toHaveLength(2);
    expect(second.getEvents()).toEqual([]);
    first.clear();
    expect(first.getEvents()).toEqual([]);
  });

  it("returns defensive event snapshots", () => {
    const { manager, orchestrator } = setup();
    orchestrator.process(report(manager), "IGNORE");
    const events = orchestrator.getEvents();
    events[0]!.entity = "external mutation";
    expect(orchestrator.getEvents()[0]!.entity).toBe(ids.part);
  });

  it("rejects unsupported strategies without preparing transactions", () => {
    const { manager } = setup();
    const resolver = new ConflictResolver();
    const context = new ResolutionContext(report(manager), null);
    expect(() => resolver.select(context, "AUTOMATIC" as ResolutionStrategy)).toThrow("Unsupported");
  });

  it("never modifies Project.mobi or executes a request", () => {
    const { input, origin, manager, orchestrator } = setup();
    const result = orchestrator.process(report(manager), "ACCEPT_EXTERNAL");
    result.request.entity = "external mutation";
    expect(origin.getProject()).toEqual(input);
    expect(orchestrator.getEvents()).toHaveLength(2);
  });
});
