import { RealProjectRunner, type ExecutionScenario, type RealProjectExecutionResult } from "../../../platform-extensions/mobi-platform-real-project-v1/src/index";
import type { LoadedProject } from "./ProjectFileLoader";
import { executionViewModel, type ExecutionViewModel } from "./ExecutionViewModel";

export interface RealProjectRunnerPort {
  execute(scenario: ExecutionScenario): RealProjectExecutionResult;
}

export interface ExecutionControllerResult {
  readonly success: boolean;
  readonly viewModel: ExecutionViewModel | null;
  readonly error: string | null;
}

export class ExecutionController {
  constructor(private readonly runner: RealProjectRunnerPort = new RealProjectRunner()) {}

  execute(project: LoadedProject): ExecutionControllerResult {
    try {
      const result = this.runner.execute({
        id: `studio-host-${project.projectId}`,
        name: `Mobi Studio Host - ${project.projectName}`,
        project: project.source,
        expectation: {
          projectId: project.projectId,
          minimumSuccessPercent: 100,
        },
      });
      return Object.freeze({
        success: result.approved,
        viewModel: executionViewModel(result),
        error: null,
      });
    } catch (error) {
      return Object.freeze({
        success: false,
        viewModel: null,
        error: error instanceof Error ? error.message : "UNKNOWN_EXECUTION_ERROR",
      });
    }
  }
}

