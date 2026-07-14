import type { ConstructionDescriptor, ConstructorResultSnapshot } from "../../../mobi-constructor/src/interfaces/ConstructorTypes";
import type { TransactionRequestSnapshot } from "../../../../orchestrator/interfaces/OrchestratorTypes";
export interface SketchUpVector { x: number; y: number; z: number }
export interface SketchUpBounds { min: SketchUpVector; max: SketchUpVector }
export interface SketchUpTransform { matrix: readonly number[] }
export interface SketchUpEntityInput { id: string; kind: "group" | "component"; name: string; definitionId?: string; materialId?: string; layerId?: string; attributes?: Record<string, unknown>; dynamicAttributes?: Record<string, unknown>; bounds?: SketchUpBounds; transform?: SketchUpTransform; children?: readonly SketchUpEntityInput[] }
export interface SketchUpMaterialInput { id: string; name: string; color?: string; opacity?: number; attributes?: Record<string, unknown> }
export interface SketchUpLayerInput { id: string; name: string; visible: boolean; attributes?: Record<string, unknown> }
export interface SketchUpModelInput { id: string; name: string; groups?: readonly SketchUpEntityInput[]; components?: readonly SketchUpEntityInput[]; materials?: readonly SketchUpMaterialInput[]; layers?: readonly SketchUpLayerInput[]; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> }
export interface ExtractedModel { id: string; name: string; groups: SketchUpEntityInput[]; components: SketchUpEntityInput[]; materials: SketchUpMaterialInput[]; layers: SketchUpLayerInput[]; attributes: Record<string, unknown>; metadata: Record<string, unknown> }
export interface GeometryFact { entityId: string; bounds: SketchUpBounds | null; transform: SketchUpTransform | null }
export interface MaterialFact { id: string; name: string; color: string | null; opacity: number | null }
export interface MappedSketchUpInput { descriptor: ConstructionDescriptor; geometry: GeometryFact[]; materials: MaterialFact[]; metadata: Record<string, unknown> }
export type AdapterStage = "EXTRACTION" | "MAPPING" | "CONSTRUCTOR";
export type AdapterSeverity = "info" | "warning" | "error";
export interface AdapterReportEntry { stage: AdapterStage; code: string; message: string; element: string; severity: AdapterSeverity; durationMs: number }
export interface AdapterStatistics { groups: number; components: number; materials: number; layers: number; imported: number; ignored: number; warnings: number; errors: number }
export interface AdapterReportSnapshot { entries: AdapterReportEntry[]; statistics: AdapterStatistics; startedAt: number; finishedAt: number; durationMs: number }
export interface AdapterResultSnapshot { success: boolean; report: AdapterReportSnapshot; constructorResult?: ConstructorResultSnapshot; transactionRequest?: TransactionRequestSnapshot }
export interface AdapterInput { model: SketchUpModelInput; transactionId: string; logicalTimestamp: number }
export type AdapterEventType = "ADAPTER_STARTED" | "STAGE_COMPLETED" | "ADAPTER_SUCCEEDED" | "ADAPTER_FAILED";
export interface AdapterEventSnapshot { type: AdapterEventType; sessionId: string; logicalTimestamp: number; stage?: AdapterStage }
export type AdapterListener = (event: AdapterEventSnapshot) => void;
export interface AdapterSessionSnapshot { id: string; active: boolean }
