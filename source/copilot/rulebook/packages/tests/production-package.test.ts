import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../../../builder/ProjectBuilder";
import type { Part, Project } from "../../../../builder/types/ProjectTypes";
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
import { DuplicatePartCodeRule } from "../Production/DuplicatePartCodeRule";
import { InvalidGrainDirectionRule } from "../Production/InvalidGrainDirectionRule";
import { InvalidPartDimensionsRule } from "../Production/InvalidPartDimensionsRule";
import { MissingEdgeBandRule } from "../Production/MissingEdgeBandRule";
import { MissingPartCodeRule } from "../Production/MissingPartCodeRule";
import { ProductionRulePackage } from "../Production/ProductionRulePackage";

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

function addPart(project: Project, id: string): Part {
  const part = structuredClone(project.environments[0]!.modules[0]!.parts[0]!);
  part.id = id;
  project.environments[0]!.modules[0]!.parts.push(part);
  return part;
}

function setFutureCode(part: Part, code: unknown): void {
  (part as unknown as Record<string, unknown>).code = code;
}

function analyze(project: Project) {
  const rulebook = new RuleBook();
  rulebook.registerPackage(new CoreRulePackage());
  rulebook.registerPackage(new CabinetryRulePackage());
  rulebook.registerPackage(new HardwareRulePackage());
  rulebook.registerPackage(new ProductionRulePackage());
  rulebook.loadPackage("mobi.core");
  rulebook.loadPackage("mobi.cabinetry");
  rulebook.loadPackage("mobi.hardware");
  rulebook.loadPackage("mobi.production");
  const origin = new MobiOrigin();
  const studio = new MobiStudio(origin);
  const copilot = new MobiCopilot(origin, studio, [rulebook.runner]);
  studio.createSession("studio-session");
  copilot.createSession("copilot-session");
  copilot.startAnalysis();
  studio.openProject(ProjectCodec.serialize(project));
  return { suggestions: copilot.getSuggestions(), origin, rulebook };
}

function production(project: Project) {
  return analyze(project).suggestions.filter((item) => item.code.startsWith("PRODUCTION_"));
}

describe("Mobi Production rules", () => {
  it("accepts a valid project and keeps Part.code rules dormant", () => {
    const project = validProject();
    const { suggestions, origin, rulebook } = analyze(project);
    expect(suggestions).toEqual([]);
    expect(origin.getProject()).toEqual(project);
    expect(rulebook.listRules().slice(-5).map((rule) => rule.id)).toEqual([
      "PRODUCTION_MISSING_PART_CODE",
      "PRODUCTION_DUPLICATE_PART_CODE",
      "PRODUCTION_INVALID_PART_DIMENSIONS",
      "PRODUCTION_INVALID_GRAIN_DIRECTION",
      "PRODUCTION_MISSING_EDGE_BAND"
    ]);
  });

  it("reports zero and negative part dimensions through the official flow", () => {
    const project = validProject();
    const size = project.environments[0]!.modules[0]!.parts[0]!.size;
    size.width = 0;
    size.height = -1;
    size.thickness = 0;
    expect(production(project).map((item) => item.path)).toEqual([
      "/environments/0/modules/0/parts/0/size/width",
      "/environments/0/modules/0/parts/0/size/height",
      "/environments/0/modules/0/parts/0/size/thickness"
    ]);
  });

  it("reports non-finite dimensions defensively", () => {
    const project = validProject();
    project.environments[0]!.modules[0]!.parts[0]!.size.width = Number.NaN;
    const results = new InvalidPartDimensionsRule().analyze(new RuleContext(project));
    expect(results).toEqual([
      expect.objectContaining({ code: "PRODUCTION_INVALID_PART_DIMENSIONS" })
    ]);
  });

  it("reports grainDirection outside the official enum defensively", () => {
    const project = validProject();
    (project.environments[0]!.modules[0]!.parts[0] as unknown as Record<string, unknown>)
      .grainDirection = "diagonal";
    expect(new InvalidGrainDirectionRule().analyze(new RuleContext(project))).toEqual([
      expect.objectContaining({
        code: "PRODUCTION_INVALID_GRAIN_DIRECTION",
        path: "/environments/0/modules/0/parts/0/grainDirection"
      })
    ]);
  });

  it("reports missing or incomplete edgeBanding defensively", () => {
    const invalidValues: unknown[] = [
      undefined,
      null,
      {},
      { top: null },
      { top: { applied: "yes" } }
    ];
    invalidValues.forEach((value) => {
      const project = validProject();
      (project.environments[0]!.modules[0]!.parts[0] as unknown as Record<string, unknown>)
        .edgeBanding = value;
      expect(new MissingEdgeBandRule().analyze(new RuleContext(project))).toHaveLength(1);
    });
  });

  it("activates missing and duplicate Part.code checks only when support is present", () => {
    const project = validProject();
    const first = project.environments[0]!.modules[0]!.parts[0]!;
    const second = addPart(project, "a23e4567-e89b-42d3-a456-426614174005");
    const third = addPart(project, "b23e4567-e89b-42d3-a456-426614174005");
    setFutureCode(first, "PART-001");
    setFutureCode(second, "   ");
    setFutureCode(third, "PART-001");
    const context = new RuleContext(project);
    expect(new MissingPartCodeRule().analyze(context).map((item) => item.path)).toEqual([
      "/environments/0/modules/0/parts/1/code"
    ]);
    expect(new DuplicatePartCodeRule().analyze(context).map((item) => item.path)).toEqual([
      "/environments/0/modules/0/parts/2/code"
    ]);
  });

  it("handles future Part.code with non-string and unique values", () => {
    const project = validProject();
    const first = project.environments[0]!.modules[0]!.parts[0]!;
    const second = addPart(project, "c23e4567-e89b-42d3-a456-426614174005");
    setFutureCode(first, 10);
    setFutureCode(second, "PART-002");
    const context = new RuleContext(project);
    expect(new MissingPartCodeRule().analyze(context)).toHaveLength(1);
    expect(new DuplicatePartCodeRule().analyze(context)).toEqual([]);
  });

  it("reports multiple diagnostics in package order", () => {
    const project = validProject();
    const first = project.environments[0]!.modules[0]!.parts[0]!;
    const second = addPart(project, "d23e4567-e89b-42d3-a456-426614174005");
    const third = addPart(project, "e23e4567-e89b-42d3-a456-426614174005");
    setFutureCode(first, "DUPLICATE");
    setFutureCode(second, "");
    setFutureCode(third, "DUPLICATE");
    second.size.width = 0;
    (second as unknown as Record<string, unknown>).grainDirection = "invalid";
    (second as unknown as Record<string, unknown>).edgeBanding = undefined;
    const book = new RuleBook();
    book.registerPackage(new ProductionRulePackage());
    book.loadPackage("mobi.production");
    expect(book.runner.runAll(new RuleContext(project)).map((item) => item.code)).toEqual([
      "PRODUCTION_MISSING_PART_CODE",
      "PRODUCTION_DUPLICATE_PART_CODE",
      "PRODUCTION_INVALID_PART_DIMENSIONS",
      "PRODUCTION_INVALID_GRAIN_DIRECTION",
      "PRODUCTION_MISSING_EDGE_BAND"
    ]);
  });

  it("does not modify the analyzed project", () => {
    const project = validProject();
    const before = structuredClone(project);
    analyze(project);
    expect(project).toEqual(before);
  });
});
