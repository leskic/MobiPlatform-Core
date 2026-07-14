import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import {
  architectureInput,
  environmentInput,
  hardwareInput,
  ids,
  infrastructureInput,
  moduleInput,
  partInput,
  projectInput
} from "../../builder/tests/fixture";
import type { Project } from "../../builder/types/ProjectTypes";
import { ProjectCodec } from "../../codec/ProjectCodec";
import { MobiOrigin } from "../../origin/MobiOrigin";
import { Bridge } from "../Bridge";
import { BridgeEvent } from "../BridgeEvent";
import { BridgeSession } from "../BridgeSession";
import { BridgeTransaction } from "../BridgeTransaction";

function validProject(): Project {
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

function setup(): { bridge: Bridge; origin: MobiOrigin; project: Project } {
  const project = validProject();
  const origin = new MobiOrigin();
  origin.openProject(ProjectCodec.serialize(project));
  return { bridge: new Bridge(origin), origin, project };
}

describe("Mobi Bridge Foundation", () => {
  it("creates, opens and closes an isolated session", () => {
    const { bridge } = setup();
    expect(bridge.getState().session).toBeNull();
    expect(bridge.createSession("bridge-session")).toEqual({
      id: "bridge-session",
      open: false,
      events: [{ type: "session-created", sessionId: "bridge-session" }]
    });
    expect(bridge.openSession().open).toBe(true);
    const closed = bridge.closeSession();
    expect(closed.open).toBe(false);
    expect(closed.events.map((event) => event.type)).toEqual([
      "session-created",
      "session-opened",
      "session-closed"
    ]);
  });

  it("reads the active project exclusively through Origin without mutation", () => {
    const { bridge, origin, project } = setup();
    bridge.createSession("bridge-session");
    bridge.openSession();
    const read = bridge.readProject();
    read.displayName = "changed outside origin";
    expect(origin.getProject()).toEqual(project);
    expect(bridge.getState()).toEqual(expect.objectContaining({
      hasProject: true,
      projectId: project.id
    }));
  });

  it("prepares deterministic export and import transactions", () => {
    const { bridge, project } = setup();
    bridge.createSession("bridge-session");
    bridge.openSession();
    const exported = bridge.prepareExport("export-001");
    const imported = bridge.prepareImport("import-001");
    expect(exported.transaction).toEqual({
      id: "export-001",
      sessionId: "bridge-session",
      projectId: project.id,
      direction: "export",
      status: "prepared"
    });
    expect(imported.transaction.direction).toBe("import");
    expect(bridge.getState().session?.events.slice(-2)).toEqual([
      { type: "transaction-prepared", sessionId: "bridge-session", transactionId: "export-001" },
      { type: "transaction-prepared", sessionId: "bridge-session", transactionId: "import-001" }
    ]);
  });

  it("does not modify Origin or the returned project during preparation", () => {
    const { bridge, origin, project } = setup();
    bridge.createSession("bridge-session");
    bridge.openSession();
    const prepared = bridge.prepareExport("export-001");
    prepared.project.displayName = "external change";
    prepared.transaction.id = "external transaction";
    expect(origin.getProject()).toEqual(project);
    expect(bridge.getState().session?.events.at(-1)?.transactionId).toBe("export-001");
  });

  it("isolates session state between Bridge instances", () => {
    const { origin } = setup();
    const first = new Bridge(origin);
    const second = new Bridge(origin);
    first.createSession("first");
    first.openSession();
    expect(first.getState().session?.open).toBe(true);
    expect(second.getState().session).toBeNull();
  });

  it("requires a created and open session", () => {
    const { bridge } = setup();
    expect(() => bridge.openSession()).toThrow("does not exist");
    bridge.createSession("bridge-session");
    expect(() => bridge.readProject()).toThrow("is not open");
    expect(() => bridge.closeSession()).toThrow("is not open");
  });

  it("rejects empty session and transaction identifiers", () => {
    const { bridge } = setup();
    expect(() => bridge.createSession("  ")).toThrow("cannot be empty");
    bridge.createSession("bridge-session");
    bridge.openSession();
    expect(() => bridge.prepareExport("")).toThrow("cannot be empty");
    expect(() => new BridgeTransaction(" ", "session", ids.project, "import"))
      .toThrow("cannot be empty");
  });

  it("represents events with and without a transaction", () => {
    expect(new BridgeEvent("session-opened", "session").get()).toEqual({
      type: "session-opened",
      sessionId: "session"
    });
    expect(new BridgeEvent("transaction-prepared", "session", "transaction").get())
      .toEqual({
        type: "transaction-prepared",
        sessionId: "session",
        transactionId: "transaction"
      });
  });

  it("reports state without an active Origin project", () => {
    const bridge = new Bridge(new MobiOrigin());
    bridge.createSession("bridge-session");
    expect(bridge.getState()).toEqual({
      session: expect.objectContaining({ id: "bridge-session" }),
      hasProject: false,
      projectId: null
    });
  });

  it("replaces prior session state when a new session is created", () => {
    const session = new BridgeSession();
    expect(session.get()).toEqual({ id: "", open: false, events: [] });
    session.create("first");
    session.openSession();
    session.create("second");
    expect(session.get()).toEqual({
      id: "second",
      open: false,
      events: [{ type: "session-created", sessionId: "second" }]
    });
  });
});
