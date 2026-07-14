import type { EndToEndExecutionResult } from "../../mobi-platform-end-to-end-v1/src/index";
import type { ChecklistItem } from "./ExecutionChecklist";
import type { RealProjectDiagnostics } from "./ExecutionDiagnostics";
import type { ExecutionScenario } from "./ExecutionScenario";

export interface HumanValidationStep {
  readonly order: number;
  readonly action: string;
  readonly expected: string;
}

export interface HumanValidationReport {
  readonly scenarioId: string;
  readonly scenarioName: string;
  readonly projectId: string | null;
  readonly approved: boolean;
  readonly checklist: readonly ChecklistItem[];
  readonly diagnostics: RealProjectDiagnostics;
  readonly summary: EndToEndExecutionResult["summary"];
  readonly script: readonly HumanValidationStep[];
}

export class HumanValidationReportFactory {
  create(
    scenario: ExecutionScenario,
    result: EndToEndExecutionResult,
    checklist: readonly ChecklistItem[],
    diagnostics: RealProjectDiagnostics,
  ): HumanValidationReport {
    return Object.freeze({
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      projectId: result.summary.projectId,
      approved: result.success && checklist.every((item) => item.passed) && diagnostics.blockers.length === 0,
      checklist,
      diagnostics,
      summary: result.summary,
      script: this.script(),
    });
  }

  private script(): readonly HumanValidationStep[] {
    return Object.freeze([
      { order: 1, action: "Abrir o Projeto.mobi real no cenário CP006.", expected: "Projeto carregado sem erro de schema." },
      { order: 2, action: "Executar o RealProjectRunner.", expected: "Cadeia completa executada automaticamente." },
      { order: 3, action: "Comparar ExecutionSummary esperado e obtido.", expected: "Status APPROVED e resultado SUCCESS." },
      { order: 4, action: "Validar evidências por etapa.", expected: "Todas as evidências obrigatórias presentes." },
      { order: 5, action: "Validar visualmente o resultado no MobiView.", expected: "Snapshot industrial carregado e coerente com o projeto." },
      { order: 6, action: "Registrar aprovação final de Charles.", expected: "Sem blockers, sem erros e checklist completo." },
    ]);
  }
}
