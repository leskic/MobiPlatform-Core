import { describe, expect, it, vi } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import type { Project } from "../../builder/types/ProjectTypes";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../builder/tests/fixture";
import { ProjectCodec } from "../../codec/ProjectCodec";
import { MobiOrigin } from "../../origin/MobiOrigin";
import { MobiStudio } from "../MobiStudio";
import { StudioEvents } from "../StudioEvents";
import { StudioSession } from "../StudioSession";
import type { StudioEvent, StudioListener } from "../types/StudioTypes";

function project(): Project {
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

describe("MobiStudio Foundation", () => {
  it("creates an isolated session and exposes presentation state", () => {
    const studio = new MobiStudio();
    expect(studio.getState()).toEqual({
      sessionId: null, status: "no-session", hasProject: false, projectId: null
    });
    expect(studio.createSession("session-1")).toEqual({ id: "session-1", active: true });
    expect(studio.getState()).toEqual({
      sessionId: "session-1", status: "ready", hasProject: false, projectId: null
    });
    const state = studio.getState();
    state.sessionId = "changed";
    expect(studio.getState().sessionId).toBe("session-1");
  });

  it("opens a project only through Origin and synchronizes state", () => {
    const origin = new MobiOrigin();
    const studio = new MobiStudio(origin);
    studio.createSession("session-1");
    const expected = project();
    const opened = studio.openProject(ProjectCodec.serialize(expected));
    expect(opened).toEqual(expected);
    expect(origin.getProject()).toEqual(expected);
    expect(studio.getState()).toEqual({
      sessionId: "session-1", status: "project-open", hasProject: true, projectId: expected.id
    });
    expect(studio.getProject()).toEqual(expected);
  });

  it("saves and closes through Origin", () => {
    const origin = new MobiOrigin();
    const studio = new MobiStudio(origin);
    studio.createSession("session-1");
    const expected = project();
    studio.openProject(ProjectCodec.serialize(expected));
    expect(JSON.parse(studio.saveProject())).toEqual(expected);
    studio.closeProject();
    expect(origin.hasProject()).toBe(false);
    expect(studio.getState()).toEqual({
      sessionId: "session-1", status: "ready", hasProject: false, projectId: null
    });
  });

  it("propagates lifecycle events in order", () => {
    const studio = new MobiStudio();
    const events: StudioEvent[] = [];
    studio.subscribe((event) => events.push(event));
    studio.createSession("session-1");
    studio.openProject(ProjectCodec.serialize(project()));
    studio.saveProject();
    studio.closeProject();
    expect(events.map((event) => event.type)).toEqual([
      "session-created", "project-opened", "project-saved", "project-closed"
    ]);
  });

  it("subscribes, unsubscribes and supports explicit notify", () => {
    const studio = new MobiStudio();
    const listener = vi.fn<StudioListener>();
    studio.subscribe(listener);
    studio.subscribe(listener);
    const event: StudioEvent = {
      type: "session-created",
      state: { sessionId: "external", status: "ready", hasProject: false, projectId: null }
    };
    studio.notify(event);
    expect(listener).toHaveBeenCalledTimes(1);
    const received = listener.mock.calls[0]![0];
    received.state.sessionId = "mutated";
    expect(event.state.sessionId).toBe("external");
    studio.unsubscribe(listener);
    studio.notify(event);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("requires a session and isolates new sessions from active Origin state", () => {
    const origin = new MobiOrigin();
    const studio = new MobiStudio(origin);
    const serialized = ProjectCodec.serialize(project());
    expect(() => studio.openProject(serialized)).toThrowError(
      expect.objectContaining({ code: "NO_ACTIVE_SESSION" })
    );
    expect(() => studio.saveProject()).toThrowError(expect.objectContaining({ code: "NO_ACTIVE_SESSION" }));
    expect(() => studio.closeProject()).toThrowError(expect.objectContaining({ code: "NO_ACTIVE_SESSION" }));
    expect(() => studio.getProject()).toThrowError(expect.objectContaining({ code: "NO_ACTIVE_SESSION" }));
    studio.createSession("session-1");
    studio.openProject(serialized);
    studio.createSession("session-2");
    expect(origin.hasProject()).toBe(false);
    expect(studio.getState().sessionId).toBe("session-2");
  });

  it("keeps session and event primitives deterministic", () => {
    const session = new StudioSession();
    expect(session.get()).toEqual({ id: "", active: false });
    expect(session.has()).toBe(false);
    const events = new StudioEvents();
    const first = vi.fn<StudioListener>();
    const second = vi.fn<StudioListener>();
    events.subscribe(first);
    events.subscribe(second);
    events.notify({
      type: "project-closed",
      state: { sessionId: "s", status: "ready", hasProject: false, projectId: null }
    });
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });
});
