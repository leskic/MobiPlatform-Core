import { describe, expect, it, vi } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../builder/tests/fixture";
import type { Project } from "../../builder/types/ProjectTypes";
import { ProjectCodec } from "../../codec/ProjectCodec";
import { MobiOrigin } from "../../origin/MobiOrigin";
import { Fingerprint } from "../Fingerprint";
import { FingerprintService } from "../FingerprintService";
import { StateMachine } from "../StateMachine";
import { SyncEvent } from "../SyncEvent";
import { SyncManager } from "../SyncManager";
import { SyncObserver } from "../SyncObserver";
import { SyncSession } from "../SyncSession";

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
  return { input, origin, manager: new SyncManager(origin) };
}

describe("Mobi Sync-Manager Foundation", () => {
  it("creates and closes isolated sessions", () => {
    const { manager } = setup();
    expect(manager.getSession()).toEqual({ id: "", active: false, state: "DETACHED" });
    expect(manager.createSession("sync-1")).toEqual({ id: "sync-1", active: true, state: "SYNCHRONIZED" });
    expect(manager.closeSession()).toEqual({ id: "sync-1", active: false, state: "DETACHED" });
  });

  it("publishes cloned internal events and supports unsubscribe", () => {
    const { manager } = setup();
    manager.createSession("sync-1");
    const listener = vi.fn((event) => { event.entity = "listener mutation"; });
    const isolatedListener = vi.fn();
    manager.subscribe(listener);
    manager.subscribe(isolatedListener);
    manager.receive(new SyncEvent("MODIFIED", "part-1", "tx-1", 1));
    expect(isolatedListener).toHaveBeenCalledWith(expect.objectContaining({ entity: "part-1" }));
    expect(manager.getSession().state).toBe("MODIFIED");
    manager.unsubscribe(listener);
    manager.unsubscribe(isolatedListener);
    manager.receive(new SyncEvent("IGNORED", "part-1", "tx-2", 2));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(manager.getSession().state).toBe("IGNORED");
  });

  it("handles observed and detached events", () => {
    const { manager } = setup();
    manager.createSession("sync-1");
    manager.receive(new SyncEvent("OBSERVED", "project", "tx-1", 0));
    expect(manager.getSession().state).toBe("SYNCHRONIZED");
    manager.receive(new SyncEvent("DETACHED", "project", "tx-2", 1));
    expect(manager.getSession().state).toBe("DETACHED");
  });

  it("generates canonical deterministic fingerprints", () => {
    const service = new FingerprintService();
    const first = service.generate({ b: 2, a: [1, { z: null, y: true }] });
    const second = service.generate({ a: [1, { y: true, z: null }], b: 2 });
    expect(first.equals(second)).toBe(true);
    expect(service.compare(first, second)).toBe(true);
    expect(first.serialize()).toBe(`sha256:${first.value}`);
    expect(first.get()).toEqual({ algorithm: "sha256", value: first.value });
    expect(service.generate(undefined).value).toHaveLength(64);
  });

  it("compares unequal fingerprints", () => {
    const service = new FingerprintService();
    expect(service.compare(service.generate(1), service.generate(2))).toBe(false);
    expect(new Fingerprint("a").equals(new Fingerprint("b"))).toBe(false);
    expect(() => new Fingerprint("")).toThrow("cannot be empty");
  });

  it("creates synchronized and divergent reports", () => {
    const { manager } = setup();
    manager.createSession("sync-1");
    const equal = manager.detectDivergence("part-1", "origin", "adapter", { x: 1 }, { x: 1 }, 10, "tx-1");
    expect(equal).toEqual(expect.objectContaining({ state: "SYNCHRONIZED", logicalTimestamp: 10, transactionId: "tx-1" }));
    const divergent = manager.detectDivergence("part-1", "origin", "adapter", { x: 1 }, { x: 2 }, 11, "tx-2");
    expect(divergent.state).toBe("DIVERGENT");
    expect(divergent.sourceFingerprint).not.toEqual(divergent.destinationFingerprint);
    expect(manager.getSession().state).toBe("DIVERGENT");
  });

  it("fingerprints Origin without modifying Project.mobi", () => {
    const { input, origin, manager } = setup();
    const first = manager.fingerprintProject();
    const second = manager.fingerprintProject();
    expect(first.equals(second)).toBe(true);
    expect(origin.getProject()).toEqual(input);
  });

  it("validates session, transaction and logical timestamp preconditions", () => {
    const { manager } = setup();
    expect(() => manager.receive(new SyncEvent("OBSERVED", "x", "tx", 0))).toThrow("No active");
    expect(() => manager.detectDivergence("x", "a", "b", 1, 2, 0, "tx")).toThrow("No active");
    expect(() => manager.createSession(" ")).toThrow("cannot be empty");
    expect(() => new SyncEvent("OBSERVED", "x", "", 0)).toThrow("cannot be empty");
    expect(() => new SyncEvent("OBSERVED", "x", "tx", -1)).toThrow("non-negative");
    expect(() => new SyncEvent("OBSERVED", "x", "tx", 1.2)).toThrow("non-negative");
    expect(() => new SyncSession().close()).toThrow("No active");
  });

  it("clears observers when a session closes", () => {
    const { manager } = setup();
    const listener = vi.fn();
    manager.createSession("sync-1");
    manager.subscribe(listener);
    manager.closeSession();
    manager.createSession("sync-2");
    manager.receive(new SyncEvent("OBSERVED", "x", "tx", 0));
    expect(listener).not.toHaveBeenCalled();
  });

  it("supports direct observer notification and all official states", () => {
    const observer = new SyncObserver();
    const listener = vi.fn();
    observer.subscribe(listener);
    observer.notify({ type: "OBSERVED", entity: "x", transactionId: "tx", logicalTimestamp: 0 });
    expect(listener).toHaveBeenCalledOnce();
    const machine = new StateMachine();
    expect(["SYNCHRONIZED", "MODIFIED", "DIVERGENT", "IGNORED", "DETACHED"].map(state =>
      machine.transition(state as ReturnType<StateMachine["get"]>)
    )).toEqual(["SYNCHRONIZED", "MODIFIED", "DIVERGENT", "IGNORED", "DETACHED"]);
  });
});
