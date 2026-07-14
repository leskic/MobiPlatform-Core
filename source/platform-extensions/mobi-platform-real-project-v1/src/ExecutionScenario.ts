import type { FlowProjectInput } from "../../mobi-platform-flow-v1/src/index";

export interface ExecutionScenarioExpectation {
  readonly projectId?: string;
  readonly minimumSuccessPercent?: number;
  readonly maxTotalDurationMs?: number;
}

export interface ExecutionScenario {
  readonly id: string;
  readonly name: string;
  readonly project: FlowProjectInput;
  readonly expectation?: ExecutionScenarioExpectation;
}

export function assertScenario(scenario: ExecutionScenario): void {
  if (!scenario.id.trim()) throw new Error("SCENARIO_ID_REQUIRED");
  if (!scenario.name.trim()) throw new Error("SCENARIO_NAME_REQUIRED");
}
