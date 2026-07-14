import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../../../builder/ProjectBuilder";
import type { Project } from "../../../../builder/types/ProjectTypes";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../../../builder/tests/fixture";
import { ProjectCodec } from "../../../../codec/ProjectCodec";
import { MobiOrigin } from "../../../../origin/MobiOrigin";
import { MobiStudio } from "../../../../studio/MobiStudio";
import { MobiCopilot } from "../../../MobiCopilot";
import { RuleBook } from "../../RuleBook";
import { CoreRulePackage } from "../Core/CoreRulePackage";

function completeProject(): Project {
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

function analyze(project: Project) {
  const rulebook = new RuleBook();
  rulebook.registerPackage(new CoreRulePackage());
  rulebook.loadPackage("mobi.core");
  const origin = new MobiOrigin();
  const studio = new MobiStudio(origin);
  const copilot = new MobiCopilot(origin, studio, [rulebook.runner]);
  studio.createSession("studio-session");
  copilot.createSession("copilot-session");
  copilot.startAnalysis();
  studio.openProject(ProjectCodec.serialize(project));
  return { suggestions: copilot.getSuggestions(), origin, rulebook };
}

describe("Mobi Core domain rules", () => {
  it("accepts a structurally valid project", () => {
    const original = completeProject();
    const { suggestions, origin, rulebook } = analyze(original);
    expect(suggestions).toEqual([]);
    expect(origin.getProject()).toEqual(original);
    expect(rulebook.listRules().map((rule) => rule.id)).toEqual([
      "CORE_PROJECT_INTEGRITY",
      "CORE_UNIQUE_ID",
      "CORE_PARENT_REFERENCE",
      "CORE_EMPTY_PROJECT"
    ]);
  });

  it("reports an empty project", () => {
    const empty = new ProjectBuilder().createProject(projectInput).build();
    expect(analyze(empty).suggestions).toEqual([
      expect.objectContaining({
        code: "CORE_EMPTY_PROJECT", severity: "warning", path: "/environments"
      })
    ]);
  });

  it("reports duplicated UUIDs at the repeated entity", () => {
    const duplicated = completeProject();
    duplicated.environments[0]!.modules[0]!.hardwares[0]!.id = ids.part;
    expect(analyze(duplicated).suggestions).toContainEqual(expect.objectContaining({
      code: "CORE_UNIQUE_ID",
      path: "/environments/0/modules/0/hardwares/0/id"
    }));
  });

  it("reports invalid parentId references and orphan entities", () => {
    const orphaned = completeProject();
    const invalid = "323e4567-e89b-42d3-a456-426614174999";
    orphaned.environments[0]!.parentId = invalid;
    orphaned.environments[0]!.architectures[0]!.parentId = invalid;
    orphaned.environments[0]!.infrastructures[0]!.parentId = invalid;
    orphaned.environments[0]!.modules[0]!.parentId = invalid;
    orphaned.environments[0]!.modules[0]!.parts[0]!.parentId = invalid;
    orphaned.environments[0]!.modules[0]!.hardwares[0]!.parentId = invalid;
    const parentErrors = analyze(orphaned).suggestions.filter(
      (suggestion) => suggestion.code === "CORE_PARENT_REFERENCE"
    );
    expect(parentErrors).toHaveLength(6);
    expect(parentErrors.map((item) => item.path)).toContain(
      "/environments/0/modules/0/parts/0/parentId"
    );
  });

  it("reports invalid architecture, infrastructure and hardware host references", () => {
    const invalidReferences = completeProject();
    const invalid = "423e4567-e89b-42d3-a456-426614174999";
    invalidReferences.environments[0]!.architectures[0]!.hostId = invalid;
    invalidReferences.environments[0]!.infrastructures[0]!.hostId = invalid;
    invalidReferences.environments[0]!.modules[0]!.hardwares[0]!.hostId = invalid;
    const integrityErrors = analyze(invalidReferences).suggestions.filter(
      (suggestion) => suggestion.code === "CORE_PROJECT_INTEGRITY"
    );
    expect(integrityErrors.map((item) => item.path)).toEqual([
      "/environments/0/architectures/0/hostId",
      "/environments/0/infrastructures/0/hostId",
      "/environments/0/modules/0/hardwares/0/hostId"
    ]);
  });

  it("supports absent optional host references", () => {
    const withoutHosts = completeProject();
    delete withoutHosts.environments[0]!.architectures[0]!.hostId;
    delete withoutHosts.environments[0]!.infrastructures[0]!.hostId;
    delete withoutHosts.environments[0]!.modules[0]!.hardwares[0]!.hostId;
    expect(analyze(withoutHosts).suggestions).toEqual([]);
  });

  it("reports multiple structural errors in deterministic rule order", () => {
    const project = completeProject();
    const invalid = "523e4567-e89b-42d3-a456-426614174999";
    project.environments[0]!.modules[0]!.hardwares[0]!.id = ids.part;
    project.environments[0]!.modules[0]!.hardwares[0]!.parentId = invalid;
    project.environments[0]!.modules[0]!.hardwares[0]!.hostId = invalid;
    expect(analyze(project).suggestions.map((item) => item.code)).toEqual([
      "CORE_PROJECT_INTEGRITY",
      "CORE_UNIQUE_ID",
      "CORE_PARENT_REFERENCE"
    ]);
  });

  it("never modifies the analyzed project", () => {
    const original = completeProject();
    const before = structuredClone(original);
    analyze(original);
    expect(original).toEqual(before);
  });
});
