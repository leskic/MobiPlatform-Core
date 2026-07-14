import type { ConstructionDescriptor, ConstructorResultSnapshot } from "../../../mobi-constructor/src/interfaces/ConstructorTypes";
import type { TransactionRequestSnapshot } from "../../../../orchestrator/interfaces/OrchestratorTypes";

export interface DinaboxPartInput { id: string; name: string; code?: string; materialId?: string; thickness?: number; orientation?: string; parameters?: Record<string, unknown>; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> }
export interface DinaboxHardwareInput { id: string; name: string; catalogId?: string; hostId?: string; parameters?: Record<string, unknown>; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> }
export interface DinaboxCabinetInput { id: string; name: string; code?: string; parts?: readonly DinaboxPartInput[]; hardware?: readonly DinaboxHardwareInput[]; parameters?: Record<string, unknown>; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> }
export interface DinaboxModuleInput { id: string; name: string; code?: string; cabinets?: readonly DinaboxCabinetInput[]; parts?: readonly DinaboxPartInput[]; hardware?: readonly DinaboxHardwareInput[]; parameters?: Record<string, unknown>; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> }
export interface DinaboxMaterialInput { id: string; name: string; code?: string; thickness?: number; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> }
export interface DinaboxProjectInput { id: string; name: string; modules?: readonly DinaboxModuleInput[]; materials?: readonly DinaboxMaterialInput[]; parameters?: Record<string, unknown>; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> }

export interface ExtractedDinaboxProject { id: string; name: string; modules: DinaboxModuleInput[]; cabinets: DinaboxCabinetInput[]; parts: DinaboxPartInput[]; hardware: DinaboxHardwareInput[]; materials: DinaboxMaterialInput[]; parameters: Record<string, unknown>; attributes: Record<string, unknown>; metadata: Record<string, unknown> }
export interface CabinetFact { id: string; moduleId: string; code: string | null; parameters: Record<string, unknown> }
export interface HardwareFact { id: string; catalogId: string | null; hostId: string | null; parameters: Record<string, unknown> }
export interface MaterialFact { id: string; code: string | null; thickness: number | null }
export interface ParameterFact { ownerId: string; values: Record<string, unknown> }
export interface MappedDinaboxInput { descriptor: ConstructionDescriptor; cabinets: CabinetFact[]; hardware: HardwareFact[]; materials: MaterialFact[]; parameters: ParameterFact[]; metadata: Record<string, unknown> }

export type AdapterStage = "EXTRACTION" | "MAPPING" | "CONSTRUCTOR";
export type AdapterSeverity = "info" | "warning" | "error";
export interface AdapterReportEntry { stage: AdapterStage; code: string; message: string; element: string; severity: AdapterSeverity; durationMs: number }
export interface AdapterStatistics { modules: number; cabinets: number; parts: number; hardware: number; materials: number; imported: number; ignored: number; warnings: number; errors: number }
export interface AdapterReportSnapshot { entries: AdapterReportEntry[]; statistics: AdapterStatistics; startedAt: number; finishedAt: number; durationMs: number }
export interface AdapterResultSnapshot { success: boolean; report: AdapterReportSnapshot; constructorResult?: ConstructorResultSnapshot; transactionRequest?: TransactionRequestSnapshot }
export interface AdapterInput { project: DinaboxProjectInput; transactionId: string; logicalTimestamp: number }
export type AdapterEventType = "ADAPTER_STARTED" | "STAGE_COMPLETED" | "ADAPTER_SUCCEEDED" | "ADAPTER_FAILED";
export interface AdapterEventSnapshot { type: AdapterEventType; sessionId: string; logicalTimestamp: number; stage?: AdapterStage }
export type AdapterListener = (event: AdapterEventSnapshot) => void;
export interface AdapterSessionSnapshot { id: string; active: boolean }
