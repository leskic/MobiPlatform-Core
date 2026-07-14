import { EndToEndRunner, type EndToEndExecutionResult } from "../../mobi-platform-end-to-end-v1/src/index";
import { ExecutionChecklist, type ChecklistItem } from "./ExecutionChecklist";
import { ExecutionDiagnostics, type RealProjectDiagnostics } from "./ExecutionDiagnostics";
import { assertScenario, type ExecutionScenario } from "./ExecutionScenario";
import { HumanValidationReportFactory, type HumanValidationReport } from "./HumanValidationReport";

export interface RealProjectExecutionResult {
  readonly approved: boolean;
  readonly scenario: ExecutionScenario;
  readonly execution: EndToEndExecutionResult;
  readonly checklist: readonly ChecklistItem[];
  readonly diagnostics: RealProjectDiagnostics;
  readonly humanValidationReport: HumanValidationReport;
}

export class RealProjectRunner {
  constructor(
    private readonly endToEnd = new EndToEndRunner(),
    private readonly checklist = new ExecutionChecklist(),
    private readonly diagnostics = new ExecutionDiagnostics(),
    private readonly report = new HumanValidationReportFactory(),
  ) {}

  execute(scenario: ExecutionScenario): RealProjectExecutionResult {
    assertScenario(scenario);
    const execution = this.endToEnd.execute({ project: scenario.project, sessionId: scenario.id });
    const checklist = this.checklist.evaluate(execution);
    const diagnostics = this.diagnostics.classify(execution, scenario);
    const humanValidationReport = this.report.create(scenario, execution, checklist, diagnostics);
    return Object.freeze({
      approved: humanValidationReport.approved,
      scenario,
      execution,
      checklist,
      diagnostics,
      humanValidationReport,
    });
  }
}
