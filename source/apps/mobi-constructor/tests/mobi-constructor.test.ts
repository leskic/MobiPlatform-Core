import { describe, expect, it, vi } from "vitest";
import { ConstructorPipeline as PublicPipeline, MobiConstructor as PublicConstructor } from "../src/index";
import { architectureInput, environmentInput, hardwareInput, ids, infrastructureInput, moduleInput, partInput, projectInput } from "../../../builder/tests/fixture";
import { ArchitectureBuilder } from "../src/builders/ArchitectureBuilder"; import { EnvironmentBuilder } from "../src/builders/EnvironmentBuilder"; import { HardwareBuilder } from "../src/builders/HardwareBuilder"; import { InfrastructureBuilder } from "../src/builders/InfrastructureBuilder"; import { ModuleBuilder } from "../src/builders/ModuleBuilder"; import { PartBuilder } from "../src/builders/PartBuilder"; import { ProjectBuilder } from "../src/builders/ProjectBuilder"; import { ConstructorContext } from "../src/ConstructorContext"; import { ConstructorError } from "../src/ConstructorError"; import { ConstructorPipeline } from "../src/ConstructorPipeline"; import { ConstructorReport } from "../src/ConstructorReport"; import { ConstructorRepository } from "../src/ConstructorRepository"; import { ConstructorResult } from "../src/ConstructorResult"; import { ConstructorSession } from "../src/ConstructorSession"; import { ConstructorEvent } from "../src/events/ConstructorEvent"; import { ConstructorEventBus } from "../src/events/ConstructorEventBus"; import type { ConstructionDescriptor, ConstructionInput } from "../src/interfaces/ConstructorTypes"; import { MobiConstructor } from "../src/MobiConstructor"; import { DomainMapper } from "../src/mapping/DomainMapper"; import { InputMapper } from "../src/mapping/InputMapper"; import { BuildStage } from "../src/pipeline/BuildStage"; import { CommitStage } from "../src/pipeline/CommitStage"; import { ValidationStage } from "../src/pipeline/ValidationStage"; import { ConstructionValidator } from "../src/validation/ConstructionValidator"; import { RuleValidationStep } from "../src/validation/RuleValidationStep"; import { SchemaValidationStep } from "../src/validation/SchemaValidationStep";
import { ConstructionPipeline as InnerPipeline } from "../src/pipeline/ConstructionPipeline";

const completeDescriptor = (): ConstructionDescriptor => ({ project: structuredClone(projectInput), environments: [{ environment: structuredClone(environmentInput), architectures: [structuredClone(architectureInput)], infrastructures: [structuredClone(infrastructureInput)], modules: [{ module: structuredClone(moduleInput), parts: [structuredClone(partInput)], hardwares: [structuredClone(hardwareInput)] }] }] });
const input = (descriptor = completeDescriptor()): ConstructionInput => ({ descriptor, transactionId: "constructor-tx-1", logicalTimestamp: 5 });

describe("Mobi Constructor Foundation v1", () => {
  it("exports the official public entry point", () => { expect(new PublicConstructor()).toBeInstanceOf(MobiConstructor); expect(new PublicPipeline()).toBeInstanceOf(ConstructorPipeline); });
  it("builds every official entity independently without mutating inputs", () => {
    const project = new ProjectBuilder().build(projectInput); const environment = new EnvironmentBuilder().build(environmentInput); const architecture = new ArchitectureBuilder().build(architectureInput); const infrastructure = new InfrastructureBuilder().build(infrastructureInput); const module = new ModuleBuilder().build(moduleInput); const part = new PartBuilder().build(partInput); const hardware = new HardwareBuilder().build(hardwareInput);
    expect(project).toMatchObject({ schemaVersion: "1.0.0", measurementUnit: "mm", rotationUnit: "degrees", environments: [] }); expect(environment).toMatchObject({ architectures: [], infrastructures: [], modules: [] }); expect(module).toMatchObject({ parts: [], hardwares: [] }); expect([architecture.id, infrastructure.id, part.id, hardware.id]).toEqual([ids.architecture, ids.infrastructure, ids.part, ids.hardware]);
    project.displayName = "mutated"; expect(projectInput.displayName).toBe("Projeto Builder");
  });

  it("maps descriptors and assembles the complete hierarchy", () => {
    const descriptor = completeDescriptor(); const mapped = new InputMapper().map(descriptor); const project = new DomainMapper().build(mapped); mapped.project.displayName = "changed";
    expect(project.environments[0]?.modules[0]?.parts[0]?.id).toBe(ids.part); expect(project.environments[0]?.modules[0]?.hardwares[0]?.id).toBe(ids.hardware); expect(descriptor.project.displayName).toBe("Projeto Builder");
  });

  it("executes InputMapper, Builders, SchemaValidator and all official RuleRunner packages before TransactionRequest", () => {
    const result = new ConstructorPipeline().construct(input()); expect(result.success).toBe(true); expect(result.failures).toEqual([]); expect(result.entity?.id).toBe(ids.project); expect(result.transactionRequest).toMatchObject({ id: "constructor-tx-1", source: "mobi-constructor", destination: "transaction-engine", status: "PREPARED" });
    expect(result.report.entries.map(entry => entry.stage)).toEqual(["INPUT_MAPPING", "BUILD", "SCHEMA_VALIDATION", "RULE_VALIDATION", "COMMIT"]);
  });

  it("returns warnings but allows a schema-valid empty project", () => {
    const result = new ConstructorPipeline().construct(input({ project: projectInput })); expect(result.success).toBe(true); expect(result.warnings.map(item => item.code)).toContain("CORE_EMPTY_PROJECT"); expect(result.transactionRequest).toBeDefined();
  });

  it("cancels on Schema failure and produces no entity or TransactionRequest", () => {
    const descriptor = completeDescriptor(); descriptor.project.id = "invalid"; const result = new ConstructorPipeline().construct(input(descriptor)); expect(result.success).toBe(false); expect(result.failures.some(item => item.code === "INVALID_FORMAT")).toBe(true); expect(result.entity).toBeUndefined(); expect(result.transactionRequest).toBeUndefined();
  });

  it("cancels on RuleRunner error with logical rollback and no partial entity", () => {
    const descriptor = completeDescriptor(); descriptor.environments![0]!.modules![0]!.parts![0]!.materialId = ""; const result = new ConstructorPipeline().construct(input(descriptor)); expect(result.success).toBe(false); expect(result.failures.map(item => item.code)).toContain("CABINETRY_MISSING_MATERIAL"); expect(result.entity).toBeUndefined(); expect(result.transactionRequest).toBeUndefined();
  });

  it("always invokes Rule validation even when Schema validation fails", () => {
    const schema = { validate: vi.fn(() => [{ code: "INVALID", path: "/id", message: "bad" }]) }; const rules = { validate: vi.fn(() => []) }; const validator = new ConstructionValidator(schema as never, rules as never); validator.validate(new ProjectBuilder().build(projectInput)); expect(schema.validate).toHaveBeenCalledOnce(); expect(rules.validate).toHaveBeenCalledOnce();
  });

  it("handles invalid imports and context contracts without silent errors", () => {
    expect(() => new InputMapper().map(null)).toThrow(ConstructorError); const result = new ConstructorPipeline().construct(input(null as never)); expect(result.success).toBe(false); expect(result.failures[0]?.code).toBe("CONSTRUCTION_ERROR");
    expect(() => new ConstructorContext({ ...input(), transactionId: "" })).toThrow("transactionId"); expect(() => new ConstructorContext({ ...input(), logicalTimestamp: -1 })).toThrow("timestamp");
  });

  it("reports stages, rules, severity, entity and deterministic time", () => {
    const times = [10, 12, 15]; const report = new ConstructorReport(() => times.shift() ?? 15); report.add({ stage: "BUILD", rule: null, code: "BUILT", message: "ok", entity: ids.project, severity: "info" }, 10); const snapshot = report.get(); expect(snapshot.entries[0]).toMatchObject({ stage: "BUILD", code: "BUILT", entity: ids.project, durationMs: 2 }); expect(snapshot.startedAt).toBe(10); expect(snapshot.durationMs).toBe(2);
  });

  it("supports deterministic default clocks and the standalone pipeline callback default", () => {
    const context = new ConstructorContext(input()); expect(context.now()).toBe(0); const report = new ConstructorReport(); report.add({ stage: "BUILD", rule: null, code: "X", message: "x", entity: "x", severity: "info" }); expect(report.get().durationMs).toBe(0);
    const mapper = new InputMapper(); const domain = new DomainMapper(); const inner = new InnerPipeline(mapper, { execute: (value: ConstructorContext) => { value.project = domain.build(value.mapped!); } } as never, { execute: () => ({ schemaErrors: [], ruleResults: [] }) } as never, { execute: () => ({ id: "x" }) } as never); expect(inner.run(new ConstructorContext(input())).success).toBe(true);
  });

  it("emits lifecycle and ordered stage events", () => {
    const constructor = new MobiConstructor(); const received: string[] = []; const listener = (event: { type: string; stage?: string }) => received.push(event.stage ?? event.type); constructor.subscribe(listener); constructor.createSession("session"); const result = constructor.construct(input()); expect(result.success).toBe(true); expect(received).toEqual(["CONSTRUCTION_STARTED", "INPUT_MAPPING", "BUILD", "SCHEMA_VALIDATION", "RULE_VALIDATION", "COMMIT", "CONSTRUCTION_SUCCEEDED"]); constructor.unsubscribe(listener);
  });

  it("stores defensive Result snapshots and clears them when closing", () => {
    const constructor = new MobiConstructor(); constructor.createSession("s"); const result = constructor.construct(input()); result.entity!.displayName = "outside"; expect(constructor.getLastResult()?.entity?.displayName).toBe("Projeto Builder"); const closed = constructor.closeSession(); expect(closed.active).toBe(false); expect(constructor.getLastResult()).toBeNull(); expect(() => constructor.construct(input())).toThrow("No active");
  });

  it("supports failed events and session/error contracts", () => {
    const constructor = new MobiConstructor(); constructor.createSession("s"); const events: string[] = []; constructor.subscribe(event => events.push(event.type)); constructor.construct(input(null as never)); expect(events.at(-1)).toBe("CONSTRUCTION_FAILED");
    const session = new ConstructorSession(); expect(() => session.create(" ")).toThrow("cannot be empty"); expect(() => session.close()).toThrow(ConstructorError); session.create("x"); expect(session.require()).toBe("x");
    const error = new ConstructorError("CODE", "message"); expect(error).toMatchObject({ name: "ConstructorError", code: "CODE", message: "message" });
  });

  it("provides defensive repository, result and event bus contracts", () => {
    const base = new ConstructorPipeline().construct(input()); const repository = new ConstructorRepository(); expect(repository.get()).toBeNull(); repository.save(base); const copy = repository.get()!; copy.failures.push({ stage: "BUILD", rule: null, code: "X", message: "x", entity: "x", severity: "error", durationMs: 0 }); expect(repository.get()?.failures).toEqual([]); repository.clear();
    const result = new ConstructorResult(base); const resultCopy = result.get(); resultCopy.warnings.length = 0; expect(result.get().success).toBe(true);
    expect(() => new ConstructorEvent("CONSTRUCTION_STARTED", "s", -1)).toThrow("non-negative"); expect(new ConstructorEvent("STAGE_COMPLETED", "s", 1, "BUILD").get().stage).toBe("BUILD"); const bus = new ConstructorEventBus(); const listener = vi.fn(); bus.subscribe(listener); bus.publish({ type: "CONSTRUCTION_STARTED", sessionId: "s", logicalTimestamp: 0 }); bus.unsubscribe(listener); bus.clear(); expect(listener).toHaveBeenCalledOnce();
  });

  it("guards direct stages from partial execution", () => {
    const context = new ConstructorContext(input()); expect(() => new BuildStage(new DomainMapper()).execute(context)).toThrow("not been mapped"); expect(() => new ValidationStage({ validate: vi.fn() } as never).execute(context)).toThrow("not been built"); expect(() => new CommitStage().execute(context)).toThrow("not been built");
  });

  it("runs standalone Schema and Rule validation steps", () => {
    const project = new DomainMapper().build(new InputMapper().map(completeDescriptor())); expect(new SchemaValidationStep().validate(project)).toEqual([]); const runner = { runAll: vi.fn(() => []) }; expect(new RuleValidationStep(runner as never).validate(project)).toEqual([]); expect(runner.runAll).toHaveBeenCalledOnce();
  });
});
