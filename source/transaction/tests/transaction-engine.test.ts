import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import {
  architectureInput, environmentInput, hardwareInput, ids, infrastructureInput,
  moduleInput, partInput, projectInput
} from "../../builder/tests/fixture";
import type { Project } from "../../builder/types/ProjectTypes";
import { ProjectCodec } from "../../codec/ProjectCodec";
import type { TransactionRequestSnapshot } from "../../orchestrator/interfaces/OrchestratorTypes";
import { MobiOrigin } from "../../origin/MobiOrigin";
import { Transaction } from "../Transaction";
import { TransactionContext } from "../TransactionContext";
import { TransactionEngine } from "../TransactionEngine";
import { TransactionValidator } from "../TransactionValidator";

function project(): Project {
  return new ProjectBuilder().createProject(projectInput).addEnvironment(environmentInput)
    .addArchitecture(ids.environment, architectureInput).addInfrastructure(ids.environment, infrastructureInput)
    .addModule(ids.environment, moduleInput).addPart(ids.module, partInput)
    .addHardware(ids.module, hardwareInput).build();
}
function request(overrides: Partial<TransactionRequestSnapshot> = {}): TransactionRequestSnapshot {
  return {
    id: "tx-001", entity: ids.project, source: "internal", destination: "external",
    strategy: "ACCEPT_INTERNAL", status: "PREPARED", logicalTimestamp: 10,
    sourceFingerprint: "source", destinationFingerprint: "destination", ...overrides
  };
}
function setup() {
  const input = project();
  const origin = new MobiOrigin();
  origin.openProject(ProjectCodec.serialize(input));
  return { input, origin, engine: new TransactionEngine(origin) };
}

describe("Mobi Transaction Engine Foundation", () => {
  it("creates and commits an atomic transaction through the official flow", () => {
    const { origin, engine } = setup();
    const result = engine.execute(request(), {
      author: "architect", operationName: "rename-project",
      operation: currentOrigin => {
        const changed = currentOrigin.getProject();
        changed.displayName = "Committed project";
        currentOrigin.openProject(ProjectCodec.serialize(changed));
      }
    });
    expect(result.success).toBe(true);
    expect(result.status).toBe("COMMITTED");
    expect(origin.getProject().displayName).toBe("Committed project");
    expect(result.log.events.map(event => event.state)).toEqual([
      "BEGIN", "VALIDATE", "EXECUTE", "COMMIT", "FINISH"
    ]);
    expect(result.log).toEqual(expect.objectContaining({
      transactionId: "tx-001", logicalTimestamp: 10, source: "internal",
      author: "architect", state: "FINISH", operations: ["rename-project"],
      result: "COMMITTED", rollbackExecuted: false
    }));
    expect(result.error).toBeUndefined();
  });

  it("rolls back completely when execution fails", () => {
    const { input, origin, engine } = setup();
    const result = engine.execute(request(), {
      author: "operator", operationName: "failing-operation",
      operation: currentOrigin => {
        const changed = currentOrigin.getProject();
        changed.displayName = "Temporary";
        currentOrigin.openProject(ProjectCodec.serialize(changed));
        throw new Error("Execution failed");
      }
    });
    expect(result.status).toBe("ROLLED_BACK");
    expect(result.error).toBe("Execution failed");
    expect(origin.getProject()).toEqual(input);
    expect(result.log.events.map(event => event.state)).toEqual([
      "BEGIN", "VALIDATE", "EXECUTE", "ROLLBACK", "FINISH"
    ]);
    expect(result.log.rollbackExecuted).toBe(true);
  });

  it("rolls back an invalid request before execution", () => {
    const { input, origin, engine } = setup();
    let executed = false;
    const result = engine.execute(request({ status: "INVALID" as "PREPARED" }), {
      author: "operator", operationName: "must-not-run", operation: () => { executed = true; }
    });
    expect(result.status).toBe("ROLLED_BACK");
    expect(result.error).toContain("PREPARED");
    expect(executed).toBe(false);
    expect(origin.getProject()).toEqual(input);
  });

  it("rolls back when the resulting project is invalid", () => {
    const { input, origin, engine } = setup();
    const result = engine.execute(request(), {
      author: "operator", operationName: "remove-project",
      operation: currentOrigin => currentOrigin.clearProject()
    });
    expect(result.status).toBe("ROLLED_BACK");
    expect(result.error).toContain("No active project");
    expect(origin.getProject()).toEqual(input);
  });

  it("normalizes unknown execution failures and rolls back", () => {
    const { origin, input, engine } = setup();
    const result = engine.execute(request(), {
      author: "operator", operationName: "unknown-failure", operation: () => { throw "failure"; }
    });
    expect(result.error).toBe("Unknown transaction error");
    expect(origin.getProject()).toEqual(input);
  });

  it("validates request identifiers and logical timestamps", () => {
    const validator = new TransactionValidator();
    expect(() => validator.validate(request({ id: " " }))).toThrow("id cannot be empty");
    expect(() => validator.validate(request({ logicalTimestamp: -1 }))).toThrow("non-negative");
    expect(() => validator.validate(request({ logicalTimestamp: 1.5 }))).toThrow("non-negative");
  });

  it("validates context author and operation name", () => {
    expect(() => new TransactionContext({ author: " ", operationName: "x", operation: () => {} }))
      .toThrow("author cannot be empty");
    expect(() => new TransactionContext({ author: "x", operationName: " ", operation: () => {} }))
      .toThrow("operation name cannot be empty");
  });

  it("keeps transaction and result snapshots isolated", () => {
    const { engine, origin } = setup();
    const result = engine.execute(request(), {
      author: "operator", operationName: "no-op", operation: () => {}
    });
    result.request.entity = "external mutation";
    result.log.events[0]!.state = "ROLLBACK";
    const second = engine.execute(request({ id: "tx-002" }), {
      author: "operator", operationName: "no-op", operation: () => {}
    });
    expect(second.request.entity).toBe(ids.project);
    expect(second.log.events[0]!.state).toBe("BEGIN");
    expect(origin.getProject()).toEqual(project());
  });

  it("exposes deterministic transaction state and defensive events", () => {
    const transaction = new Transaction(request());
    expect(transaction.getState()).toBe("BEGIN");
    transaction.transition("VALIDATE");
    const events = transaction.getEvents();
    events[0]!.state = "ROLLBACK";
    expect(transaction.getEvents().map(event => event.state)).toEqual(["BEGIN", "VALIDATE"]);
  });

  it("rolls back when Origin reports an invalid project before execution", () => {
    let restored = false;
    const fakeOrigin = {
      getProject: () => project(),
      validateProject: () => ({ valid: false, errors: [] }),
      openProject: () => { restored = true; }
    } as unknown as MobiOrigin;
    const result = new TransactionEngine(fakeOrigin).execute(request(), {
      author: "operator", operationName: "no-op", operation: () => {}
    });
    expect(result.error).toBe("Origin project is invalid before transaction");
    expect(restored).toBe(true);
  });

  it("rolls back when Origin reports an invalid project after execution", () => {
    let validations = 0;
    let restored = false;
    const fakeOrigin = {
      getProject: () => project(),
      validateProject: () => ({ valid: ++validations === 1, errors: [] }),
      openProject: () => { restored = true; }
    } as unknown as MobiOrigin;
    const result = new TransactionEngine(fakeOrigin).execute(request(), {
      author: "operator", operationName: "no-op", operation: () => {}
    });
    expect(result.error).toBe("Origin project is invalid after transaction");
    expect(restored).toBe(true);
  });
});
