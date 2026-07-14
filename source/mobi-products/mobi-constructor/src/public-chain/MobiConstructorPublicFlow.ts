import type {
  ConstructorProjectV1,
  ProjectMobiEnvelopeV1,
  ProjectMobiReaderPortV1,
} from "../../../../platform-extensions/mobi-platform-chain-v1/src/index";
import { IndustrialExportTransaction } from "../adapters/IndustrialExportTransaction";
import { TraceabilityTransaction } from "../adapters/TraceabilityTransaction";
import { BOMManager } from "../bom-manager/BOMManager";
import { CAMBridge } from "../cam-bridge/CAMBridge";
import type { IndustrialLog, SheetSpecification, TelemetryRecord } from "../closed-loop/Phase3Types";
import { FeedbackLoop } from "../feedback-loop/FeedbackLoop";
import { NestingEngine } from "../nesting-engine/NestingEngine";
import { ConstructorIndustrialRuleSet } from "../part-generator/IndustrialRuleSet";
import { PartGenerator } from "../part-generator/PartGenerator";
import { ClosedLoopPipeline } from "../pipeline/ClosedLoopPipeline";
import { IndustrializationPipeline } from "../pipeline/IndustrializationPipeline";
import type {
  IndustrialContractSnapshot,
  IndustrialTransactionCoordinatorPort,
} from "../public-industrial-contracts/MICContracts";
import { ConstructorIndustrialProvider } from "../public-industrial-contracts/ConstructorIndustrialProvider";
import { VerificationEngine } from "../verification-engine/VerificationEngine";

export interface ConstructorPublicFlowContext {
  readonly sequence: number;
  readonly wasteFactor?: number;
  readonly sheet: SheetSpecification;
  readonly logs: readonly IndustrialLog[];
  readonly telemetry: readonly TelemetryRecord[];
  readonly ruleRunner: { analyze(project: Readonly<ConstructorProjectV1>): readonly unknown[] };
  readonly cognitiveGate: { analyze(sequence: number): { status: "HEALTHY" | "ISSUES"; diagnostics: readonly { severity: "info" | "warning" | "error" }[] } };
  readonly cognitiveEvents: { publish(event: { type: "INDUSTRIAL_VERIFICATION"; projectId: string; compliant: boolean; auditId: string }): void };
  readonly exportRegistrar: { register(projectId: string, fingerprint: string): { success: boolean; transactionId?: string } };
  readonly traceRegistrar: { register(projectId: string, auditId: string): { success: boolean; transactionId?: string } };
  readonly transactionCoordinator: IndustrialTransactionCoordinatorPort;
}

export class MobiConstructorPublicFlow {
  constructor(private readonly reader: ProjectMobiReaderPortV1) {}

  execute(envelope: ProjectMobiEnvelopeV1, context: ConstructorPublicFlowContext): IndustrialContractSnapshot {
    const project = this.reader.read(envelope);
    const generator = new PartGenerator(new ConstructorIndustrialRuleSet());
    const bom = new BOMManager();
    const cam = new CAMBridge();
    const industrial = new IndustrializationPipeline(
      generator,
      context.ruleRunner,
      bom,
      cam,
      context.cognitiveGate,
      context.exportRegistrar,
    ).execute(project, context.sequence, context.wasteFactor ?? 0);
    const closedLoop = new ClosedLoopPipeline(
      generator,
      new NestingEngine(),
      bom,
      cam,
      new FeedbackLoop(),
      new VerificationEngine(context.cognitiveEvents),
      context.traceRegistrar,
    ).execute(project, context.sheet, context.logs, context.telemetry);
    return new ConstructorIndustrialProvider(context.transactionCoordinator).provide(industrial, closedLoop);
  }
}
