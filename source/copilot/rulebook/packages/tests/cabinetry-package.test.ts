import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../../../builder/ProjectBuilder";
import type { Environment, Module, Project } from "../../../../builder/types/ProjectTypes";
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
import { CabinetryRulePackage } from "../Cabinetry/CabinetryRulePackage";

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

function secondEnvironment(project: Project, code = "AMB-002"): Environment {
  const environment = structuredClone(project.environments[0]!);
  environment.id = "623e4567-e89b-42d3-a456-426614174001";
  environment.code = code;
  environment.displayName = "Second environment";
  environment.architectures = [];
  environment.infrastructures = [];
  environment.modules = [];
  return environment;
}

function secondModule(environmentId: string, code = "MOD-002"): Module {
  const module = structuredClone(validProject().environments[0]!.modules[0]!);
  module.id = "623e4567-e89b-42d3-a456-426614174004";
  module.parentId = environmentId;
  module.code = code;
  module.displayName = "Second module";
  module.parts = [];
  module.hardwares = [];
  return module;
}

function analyze(project: Project) {
  const rulebook = new RuleBook();
  rulebook.registerPackage(new CoreRulePackage());
  rulebook.registerPackage(new CabinetryRulePackage());
  rulebook.loadPackage("mobi.core");
  rulebook.loadPackage("mobi.cabinetry");
  const origin = new MobiOrigin();
  const studio = new MobiStudio(origin);
  const copilot = new MobiCopilot(origin, studio, [rulebook.runner]);
  studio.createSession("studio-session");
  copilot.createSession("copilot-session");
  copilot.startAnalysis();
  studio.openProject(ProjectCodec.serialize(project));
  return { suggestions: copilot.getSuggestions(), origin, rulebook };
}

function cabinetry(project: Project) {
  return analyze(project).suggestions.filter((item) => item.code.startsWith("CABINETRY_"));
}

describe("Mobi Cabinetry rules", () => {
  it("accepts a valid cabinetry project", () => {
    const project = validProject();
    const { suggestions, origin, rulebook } = analyze(project);
    expect(suggestions).toEqual([]);
    expect(origin.getProject()).toEqual(project);
    expect(rulebook.listRules().slice(-5).map((rule) => rule.id)).toEqual([
      "CABINETRY_DUPLICATE_MODULE_CODE",
      "CABINETRY_DUPLICATE_ENVIRONMENT_CODE",
      "CABINETRY_EMPTY_MODULE",
      "CABINETRY_MISSING_MATERIAL",
      "CABINETRY_DUPLICATE_HARDWARE"
    ]);
  });

  it("reports an empty module", () => {
    const project = validProject();
    project.environments[0]!.modules.push(secondModule(ids.environment));
    expect(cabinetry(project)).toContainEqual(expect.objectContaining({
      code: "CABINETRY_EMPTY_MODULE",
      severity: "warning",
      path: "/environments/0/modules/1/parts"
    }));
  });

  it("reports a missing or blank material", () => {
    const project = validProject();
    project.environments[0]!.modules[0]!.parts[0]!.materialId = "   ";
    expect(cabinetry(project)).toEqual([
      expect.objectContaining({
        code: "CABINETRY_MISSING_MATERIAL",
        path: "/environments/0/modules/0/parts/0/materialId"
      })
    ]);
  });

  it("reports duplicate module codes across the project", () => {
    const project = validProject();
    const environment = secondEnvironment(project);
    environment.modules.push(secondModule(environment.id, moduleInput.code));
    project.environments.push(environment);
    expect(cabinetry(project)).toContainEqual(expect.objectContaining({
      code: "CABINETRY_DUPLICATE_MODULE_CODE",
      path: "/environments/1/modules/0/code"
    }));
  });

  it("reports duplicate environment codes", () => {
    const project = validProject();
    project.environments.push(secondEnvironment(project, environmentInput.code));
    expect(cabinetry(project)).toEqual([
      expect.objectContaining({
        code: "CABINETRY_DUPLICATE_ENVIRONMENT_CODE",
        path: "/environments/1/code"
      })
    ]);
  });

  it("reports duplicate hardware identity in the same parent", () => {
    const project = validProject();
    project.environments[0]!.modules[0]!.hardwares.push(
      structuredClone(project.environments[0]!.modules[0]!.hardwares[0]!)
    );
    expect(cabinetry(project)).toContainEqual(expect.objectContaining({
      code: "CABINETRY_DUPLICATE_HARDWARE",
      path: "/environments/0/modules/0/hardwares/1/id"
    }));
  });

  it("reports multiple diagnostics in package order", () => {
    const project = validProject();
    const environment = secondEnvironment(project, environmentInput.code);
    environment.modules.push(secondModule(environment.id, moduleInput.code));
    project.environments.push(environment);
    project.environments[0]!.modules[0]!.parts[0]!.materialId = "";
    project.environments[0]!.modules[0]!.hardwares.push(
      structuredClone(project.environments[0]!.modules[0]!.hardwares[0]!)
    );
    expect(cabinetry(project).map((item) => item.code)).toEqual([
      "CABINETRY_DUPLICATE_MODULE_CODE",
      "CABINETRY_DUPLICATE_ENVIRONMENT_CODE",
      "CABINETRY_EMPTY_MODULE",
      "CABINETRY_MISSING_MATERIAL",
      "CABINETRY_DUPLICATE_HARDWARE"
    ]);
  });

  it("does not modify the analyzed project", () => {
    const project = validProject();
    const before = structuredClone(project);
    analyze(project);
    expect(project).toEqual(before);
  });
});
