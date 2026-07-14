import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../../../builder/ProjectBuilder";
import type { Hardware, Project } from "../../../../builder/types/ProjectTypes";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../../../builder/tests/fixture";
import { ProjectCodec } from "../../../../codec/ProjectCodec";
import { MobiOrigin } from "../../../../origin/MobiOrigin";
import { MobiStudio } from "../../../../studio/MobiStudio";
import { MobiCopilot } from "../../../MobiCopilot";
import { RuleContext } from "../../../rules/RuleContext";
import { RuleBook } from "../../RuleBook";
import { CabinetryRulePackage } from "../Cabinetry/CabinetryRulePackage";
import { CoreRulePackage } from "../Core/CoreRulePackage";
import { HardwareRulePackage } from "../Hardware/HardwareRulePackage";
import { MissingHardwarePositionRule } from "../Hardware/MissingHardwarePositionRule";

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

function analyze(project: Project) {
  const rulebook = new RuleBook();
  rulebook.registerPackage(new CoreRulePackage());
  rulebook.registerPackage(new CabinetryRulePackage());
  rulebook.registerPackage(new HardwareRulePackage());
  rulebook.loadPackage("mobi.core");
  rulebook.loadPackage("mobi.cabinetry");
  rulebook.loadPackage("mobi.hardware");
  const origin = new MobiOrigin();
  const studio = new MobiStudio(origin);
  const copilot = new MobiCopilot(origin, studio, [rulebook.runner]);
  studio.createSession("studio-session");
  copilot.createSession("copilot-session");
  copilot.startAnalysis();
  studio.openProject(ProjectCodec.serialize(project));
  return { suggestions: copilot.getSuggestions(), origin, rulebook };
}

function hardware(project: Project) {
  return analyze(project).suggestions.filter((item) => item.code.startsWith("HARDWARE_"));
}

function additionalHardware(project: Project): Hardware {
  const item = structuredClone(project.environments[0]!.modules[0]!.hardwares[0]!);
  item.id = "723e4567-e89b-42d3-a456-426614174006";
  return item;
}

describe("Mobi Hardware rules", () => {
  it("accepts a valid hardware project", () => {
    const project = validProject();
    const { suggestions, origin, rulebook } = analyze(project);
    expect(suggestions).toEqual([]);
    expect(origin.getProject()).toEqual(project);
    expect(rulebook.listRules().slice(-5).map((rule) => rule.id)).toEqual([
      "HARDWARE_INVALID_HOST",
      "HARDWARE_INVALID_CATALOG",
      "HARDWARE_DUPLICATE_CATALOG_ON_HOST",
      "HARDWARE_MISSING_POSITION",
      "HARDWARE_ORPHAN"
    ]);
  });

  it("reports a provided hostId that does not exist in the module", () => {
    const project = validProject();
    project.environments[0]!.modules[0]!.hardwares[0]!.hostId =
      "723e4567-e89b-42d3-a456-426614174999";
    expect(hardware(project)).toEqual([
      expect.objectContaining({
        code: "HARDWARE_INVALID_HOST",
        path: "/environments/0/modules/0/hardwares/0/hostId"
      })
    ]);
  });

  it("accepts omitted or null hostId", () => {
    const project = validProject();
    delete project.environments[0]!.modules[0]!.hardwares[0]!.hostId;
    const second = additionalHardware(project);
    second.hostId = null;
    second.catalogId = "OTHER-CATALOG";
    project.environments[0]!.modules[0]!.hardwares.push(second);
    expect(hardware(project)).toEqual([]);
  });

  it("reports an empty catalogId without consulting an external catalog", () => {
    const project = validProject();
    project.environments[0]!.modules[0]!.hardwares[0]!.catalogId = "   ";
    expect(hardware(project)).toEqual([
      expect.objectContaining({
        code: "HARDWARE_INVALID_CATALOG",
        path: "/environments/0/modules/0/hardwares/0/catalogId"
      })
    ]);
  });

  it("reports the same catalogId repeated on the same host", () => {
    const project = validProject();
    project.environments[0]!.modules[0]!.hardwares.push(additionalHardware(project));
    expect(hardware(project)).toEqual([
      expect.objectContaining({
        code: "HARDWARE_DUPLICATE_CATALOG_ON_HOST",
        severity: "warning",
        path: "/environments/0/modules/0/hardwares/1/catalogId"
      })
    ]);
  });

  it("does not treat the same catalog on different hosts as duplicate", () => {
    const project = validProject();
    const secondPart = structuredClone(project.environments[0]!.modules[0]!.parts[0]!);
    secondPart.id = "723e4567-e89b-42d3-a456-426614174005";
    project.environments[0]!.modules[0]!.parts.push(secondPart);
    const second = additionalHardware(project);
    second.hostId = secondPart.id;
    project.environments[0]!.modules[0]!.hardwares.push(second);
    expect(hardware(project)).toEqual([]);
  });

  it("reports orphan hardware", () => {
    const project = validProject();
    project.environments[0]!.modules[0]!.hardwares[0]!.parentId =
      "723e4567-e89b-42d3-a456-426614174999";
    expect(hardware(project)).toEqual([
      expect.objectContaining({
        code: "HARDWARE_ORPHAN",
        path: "/environments/0/modules/0/hardwares/0/parentId"
      })
    ]);
  });

  it("reports missing and non-finite position values defensively", () => {
    const project = validProject();
    const base = project.environments[0]!.modules[0]!.hardwares[0]!;
    const invalidPositions: unknown[] = [
      undefined,
      null,
      { x: "0", y: 0, z: 0 },
      { x: Number.NaN, y: 0, z: 0 },
      { x: 0, y: "0", z: 0 },
      { x: 0, y: Number.POSITIVE_INFINITY, z: 0 },
      { x: 0, y: 0, z: "0" },
      { x: 0, y: 0, z: Number.NEGATIVE_INFINITY }
    ];
    project.environments[0]!.modules[0]!.hardwares = invalidPositions.map((position, index) => ({
      ...structuredClone(base),
      id: `823e4567-e89b-42d3-a456-4266141740${String(index).padStart(2, "0")}`,
      position
    })) as Hardware[];
    const results = new MissingHardwarePositionRule().analyze(new RuleContext(project));
    expect(results).toHaveLength(invalidPositions.length);
    expect(results.every((item) => item.code === "HARDWARE_MISSING_POSITION")).toBe(true);
  });

  it("reports multiple diagnostics in package order", () => {
    const project = validProject();
    const first = project.environments[0]!.modules[0]!.hardwares[0]!;
    first.hostId = "923e4567-e89b-42d3-a456-426614174999";
    first.catalogId = "";
    const second = additionalHardware(project);
    second.hostId = first.hostId;
    second.catalogId = first.catalogId;
    second.parentId = "923e4567-e89b-42d3-a456-426614174998";
    project.environments[0]!.modules[0]!.hardwares.push(second);
    expect(hardware(project).map((item) => item.code)).toEqual([
      "HARDWARE_INVALID_HOST",
      "HARDWARE_INVALID_HOST",
      "HARDWARE_INVALID_CATALOG",
      "HARDWARE_INVALID_CATALOG",
      "HARDWARE_DUPLICATE_CATALOG_ON_HOST",
      "HARDWARE_ORPHAN"
    ]);
  });

  it("does not modify the analyzed project", () => {
    const project = validProject();
    const before = structuredClone(project);
    analyze(project);
    expect(project).toEqual(before);
  });
});
