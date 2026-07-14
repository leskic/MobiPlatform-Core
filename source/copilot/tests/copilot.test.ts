import { describe, expect, it, vi } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import type { Project } from "../../builder/types/ProjectTypes";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../builder/tests/fixture";
import { ProjectCodec } from "../../codec/ProjectCodec";
import { MobiOrigin } from "../../origin/MobiOrigin";
import { MobiStudio } from "../../studio/MobiStudio";
import type { StudioEvent } from "../../studio/types/StudioTypes";
import { MobiCopilot } from "../MobiCopilot";
import { CopilotSession } from "../CopilotSession";
import { Suggestion } from "../Suggestion";
import type { CopilotListener, CopilotRule } from "../types/CopilotTypes";

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

function setup(rules: readonly CopilotRule[] = []) {
  const origin = new MobiOrigin();
  const studio = new MobiStudio(origin);
  const copilot = new MobiCopilot(origin, studio, rules);
  studio.createSession("studio-session");
  return { origin, studio, copilot };
}

const observationalRule: CopilotRule = {
  code: "OBSERVE_PROJECT",
  analyze(project) {
    return [new Suggestion("PROJECT_OBSERVED", "info", "/id", `Observed ${project.id}`)];
  }
};

describe("MobiCopilot Foundation", () => {
  it("creates a deterministic session", () => {
    expect(new CopilotSession().get()).toEqual({ id: "", active: false, analyzing: false });
    const { copilot } = setup();
    expect(copilot.createSession("copilot-session")).toEqual({
      id: "copilot-session", active: true, analyzing: false
    });
    expect(copilot.getSuggestions()).toEqual([]);
  });

  it("starts, analyzes and stops without changing the project", () => {
    const { origin, studio, copilot } = setup([observationalRule]);
    copilot.createSession("copilot-session");
    copilot.startAnalysis();
    const expected = validProject();
    studio.openProject(ProjectCodec.serialize(expected));
    const result = copilot.analyzeProject();
    expect(result.projectId).toBe(expected.id);
    expect(result.suggestions).toEqual([
      expect.objectContaining({ code: "PROJECT_OBSERVED", severity: "info", path: "/id" })
    ]);
    expect(origin.getProject()).toEqual(expected);
    copilot.stopAnalysis();
    studio.saveProject();
    expect(origin.getProject()).toEqual(expected);
  });

  it("automatically observes public Studio project events only while started", () => {
    const { studio, copilot } = setup([observationalRule]);
    copilot.createSession("copilot-session");
    copilot.startAnalysis();
    copilot.startAnalysis();
    studio.openProject(ProjectCodec.serialize(validProject()));
    expect(copilot.getSuggestions()).toHaveLength(1);
    studio.saveProject();
    expect(copilot.getSuggestions()).toHaveLength(1);
    const unrelated: StudioEvent = {
      type: "project-closed",
      state: studio.getState()
    };
    studio.notify(unrelated);
    expect(copilot.getSuggestions()).toHaveLength(1);
    copilot.stopAnalysis();
  });

  it("lists and clears isolated suggestions", () => {
    const { studio, copilot } = setup([observationalRule]);
    copilot.createSession("copilot-session");
    copilot.startAnalysis();
    studio.openProject(ProjectCodec.serialize(validProject()));
    const suggestions = copilot.getSuggestions() as Suggestion[];
    suggestions[0] = new Suggestion("CHANGED", "error", "/", "changed");
    expect(copilot.getSuggestions()[0]?.code).toBe("PROJECT_OBSERVED");
    copilot.clearSuggestions();
    expect(copilot.getSuggestions()).toEqual([]);
  });

  it("publishes events and supports unsubscribe", () => {
    const { studio, copilot } = setup([observationalRule]);
    const listener = vi.fn<CopilotListener>();
    copilot.subscribe(listener);
    copilot.subscribe(listener);
    copilot.createSession("copilot-session");
    copilot.startAnalysis();
    studio.openProject(ProjectCodec.serialize(validProject()));
    copilot.clearSuggestions();
    copilot.stopAnalysis();
    expect(listener.mock.calls.map(([event]) => event.type)).toEqual([
      "analysis-started", "analysis-completed", "suggestions-cleared", "analysis-stopped"
    ]);
    copilot.unsubscribe(listener);
    copilot.clearSuggestions();
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("isolates the model passed to rules", () => {
    const mutatingRule: CopilotRule = {
      code: "MUTATION_ATTEMPT",
      analyze(project) {
        (project as Project).displayName = "Mutated snapshot";
        return [];
      }
    };
    const { origin, studio, copilot } = setup([mutatingRule]);
    const expected = validProject();
    copilot.createSession("copilot-session");
    copilot.startAnalysis();
    studio.openProject(ProjectCodec.serialize(expected));
    expect(origin.getProject()).toEqual(expected);
  });

  it("requires an active session and started analysis", () => {
    const { studio, copilot } = setup();
    studio.openProject(ProjectCodec.serialize(validProject()));
    expect(() => copilot.startAnalysis()).toThrowError(
      expect.objectContaining({ code: "NO_ACTIVE_SESSION" })
    );
    expect(() => copilot.stopAnalysis()).toThrowError(
      expect.objectContaining({ code: "NO_ACTIVE_SESSION" })
    );
    copilot.createSession("copilot-session");
    expect(() => copilot.analyzeProject()).toThrowError(
      expect.objectContaining({ code: "ANALYSIS_NOT_STARTED" })
    );
  });

  it("uses an empty approved rule set by default", () => {
    const { studio, copilot } = setup();
    copilot.createSession("copilot-session");
    copilot.startAnalysis();
    studio.openProject(ProjectCodec.serialize(validProject()));
    expect(copilot.getSuggestions()).toEqual([]);
  });
});
