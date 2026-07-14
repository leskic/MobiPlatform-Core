import type { Project } from "../../../../builder/types/ProjectTypes";
import type { Bridge } from "../../../../bridge/Bridge";
import type { RuleResult } from "../../../../copilot/rules/RuleResult";
import type { MobiOrigin } from "../../../../origin/MobiOrigin";
import type { SyncOrchestrator } from "../../../../orchestrator/SyncOrchestrator";
import type { TransactionRequestSnapshot } from "../../../../orchestrator/interfaces/OrchestratorTypes";
import type { DivergenceReportSnapshot } from "../../../../sync/interfaces/SyncTypes";
import type { SyncManager } from "../../../../sync/SyncManager";
import type { TransactionEngine } from "../../../../transaction/TransactionEngine";
import type { TransactionResultSnapshot } from "../../../../transaction/interfaces/TransactionTypes";
import type { DinaboxAdapter } from "../../../mobi-dinabox-adapter/src/DinaboxAdapter";
import type { AdapterInput, AdapterResultSnapshot, DinaboxProjectInput, HardwareFact, MaterialFact, ParameterFact } from "../../../mobi-dinabox-adapter/src/interfaces/DinaboxAdapterTypes";

export type SynchronizationMode = "IMPORT" | "UPDATE" | "RECONCILE" | "INCREMENTAL";
export type SynchronizationStatus = "CONFIRMATION_REQUIRED" | "SYNCHRONIZED" | "COMMITTED" | "ROLLED_BACK" | "BLOCKED";
export type DivergenceKind = "HARDWARE" | "MATERIAL" | "PARAMETER" | "PROJECT";
export interface ClassifiedDivergence { kind: DivergenceKind; report: DivergenceReportSnapshot }
export interface DivergenceGroup { kind: DivergenceKind; items: ClassifiedDivergence[] }
export interface SynchronizationReportEntry { stage: "ADAPTER" | "DIVERGENCE" | "VALIDATION" | "TRANSACTION"; code: string; message: string; severity: "info" | "warning" | "error"; entity: string }
export interface SynchronizationStatistics { divergences: number; hardwareIssues: number; warnings: number; errors: number }
export interface SynchronizationReportSnapshot { entries: SynchronizationReportEntry[]; divergences: ClassifiedDivergence[]; statistics: SynchronizationStatistics; startedAt: number; finishedAt: number; durationMs: number }
export interface SynchronizationResultSnapshot { success: boolean; status: SynchronizationStatus; report: SynchronizationReportSnapshot; divergence?: DivergenceReportSnapshot; request?: TransactionRequestSnapshot; transaction?: TransactionResultSnapshot; adapterResult?: AdapterResultSnapshot }
export interface SynchronizationInput { adapterInput: AdapterInput; mode: SynchronizationMode; confirmed: boolean; author: string; divergenceKind?: DivergenceKind; failOperation?: boolean }
export interface SynchronizationPlan { mode: SynchronizationMode; requiresConfirmation: true; steps: readonly ["ADAPT", "ANALYZE", "CONFIRM", "TRANSACT", "VERIFY"] }
export interface SynchronizationContextSnapshot { input: SynchronizationInput; sourceProject: Project | null; destinationProject: Project | null; divergence: DivergenceReportSnapshot | null }
export interface MobiDinaSessionSnapshot { id: string; active: boolean }
export type MobiDinaEventType = "SESSION_STARTED" | "SESSION_ENDED" | "SYNC_STARTED" | "CONFIRMATION_REQUIRED" | "SYNC_COMMITTED" | "SYNC_ROLLED_BACK" | "DIVERGENCE_DETECTED";
export interface MobiDinaEventSnapshot { type: MobiDinaEventType; sessionId: string; logicalTimestamp: number; transactionId?: string }
export type MobiDinaListener = (event: MobiDinaEventSnapshot) => void;
export interface MobiDinaDependencies { adapter: DinaboxAdapter; origin: MobiOrigin; transactionEngine: TransactionEngine; syncManager: SyncManager; orchestrator: SyncOrchestrator; bridge: Bridge }
export interface IntegrationSnapshot { lastResult: SynchronizationResultSnapshot | null; history: SynchronizationResultSnapshot[] }
export interface DinaboxMappingSnapshot { project: DinaboxProjectInput; hardware: HardwareFact[]; materials: MaterialFact[]; parameters: ParameterFact[] }
export interface HardwareValidationSnapshot { valid: boolean; issues: RuleResult[] }
