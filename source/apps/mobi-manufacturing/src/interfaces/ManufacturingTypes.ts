import type { Project } from "../../../../builder/types/ProjectTypes"; import type { DetailingResultSnapshot, DocumentFingerprintSnapshot, HardwareListItem, MaterialListItem, PartListItem } from "../../../mobi-detalhamento/src/interfaces/DetailingTypes"; import type { TransactionResultSnapshot } from "../../../../transaction/interfaces/TransactionTypes";
export type ProductionStatus = "PENDENTE" | "AGUARDANDO" | "LIBERADO" | "EM_PRODUCAO" | "PAUSADO" | "CONCLUIDO" | "REQUER_REVISAO" | "CANCELADO";
export interface ProductionTaskSnapshot { id: string; partId: string; partCode: string | null; operation: "CUTTING" | "ASSEMBLY"; status: ProductionStatus; workstation: string | null }
export interface ProductionOrderSnapshot { id: string; environmentId: string; status: ProductionStatus; tasks: ProductionTaskSnapshot[] }
export interface ProductionBatchSnapshot { id: string; materialId: string; thickness: number; status: ProductionStatus; orders: ProductionOrderSnapshot[] }
export interface TimelineEntry { logicalTimestamp: number; targetId: string; from: ProductionStatus; to: ProductionStatus; transactionId: string }
export interface ManufacturingPlanSnapshot { id: string; projectId: string; revision: string; fingerprint: DocumentFingerprintSnapshot; status: ProductionStatus; batches: ProductionBatchSnapshot[]; partQueue: PartListItem[]; hardwareQueue: HardwareListItem[]; materialQueue: MaterialListItem[]; cuttingQueue: PartListItem[]; timeline: TimelineEntry[] }
export interface WorkstationAssignmentSnapshot { taskId: string; workstation: string }
export interface ManufacturingInput { project: Project; detailing: DetailingResultSnapshot; revision: string; logicalTimestamp: number }
export interface StatusUpdateInput { targetId: string; status: ProductionStatus; transactionId: string; logicalTimestamp: number; author: string; failOperation?: boolean }
export interface ManufacturingReportEntry { stage: "VALIDATION" | "PLANNING" | "TRANSACTION" | "REVISION"; code: string; message: string; severity: "info" | "warning" | "error"; entity: string }
export interface ManufacturingReportSnapshot { entries: ManufacturingReportEntry[]; startedAt: number; finishedAt: number; durationMs: number }
export interface ManufacturingResultSnapshot { success: boolean; plan: ManufacturingPlanSnapshot | null; report: ManufacturingReportSnapshot; transaction?: TransactionResultSnapshot }
export interface ManufacturingContextSnapshot { input: ManufacturingInput; plan: ManufacturingPlanSnapshot | null }
export interface ManufacturingSessionSnapshot { id: string; active: boolean }
export type ManufacturingEventType = "PLAN_CREATED" | "STATUS_COMMITTED" | "STATUS_ROLLED_BACK" | "REVISION_REQUIRED" | "PLAN_CANCELLED";
export interface ManufacturingEventSnapshot { type: ManufacturingEventType; sessionId: string; targetId: string; logicalTimestamp: number; transactionId?: string }
export type ManufacturingListener = (event: ManufacturingEventSnapshot) => void;
