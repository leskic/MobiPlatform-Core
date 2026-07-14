import type { DocumentFingerprintSnapshot, PartListItem } from "../../../mobi-detalhamento/src/interfaces/DetailingTypes"; import type { ManufacturingPlanSnapshot } from "../../../mobi-manufacturing/src/interfaces/ManufacturingTypes";
export type OperationType = "PROFILE" | "POCKET" | "DRILL" | "GROOVE" | "ENGRAVING"; export type MachiningStage = "PLANNED" | "VALIDATED" | "PACKAGED";
export interface Point2D { x: number; y: number } export interface Contour { points: Point2D[]; closed: boolean } export interface Region { contour: Contour; depth: number }
export interface ToolpathOperationSnapshot { id: string; partId: string; type: OperationType; toolId: string | null; contour?: Contour; region?: Region; position?: Point2D; depth: number; text?: string }
export interface ToolSnapshot { id: string; kind: "ROUTER" | "DRILL" | "ENGRAVER"; diameter: number }
export interface MachineProfileSnapshot { id: string; displayName: string; supportedOperations: OperationType[]; maximumWidth: number; maximumHeight: number }
export interface ToolAssignmentSnapshot { operationId: string; toolId: string }
export interface OperationSequenceSnapshot { operations: ToolpathOperationSnapshot[] }
export interface ToolpathPlanSnapshot { id: string; projectId: string; fingerprint: DocumentFingerprintSnapshot; stage: MachiningStage; operations: ToolpathOperationSnapshot[]; sequence: OperationSequenceSnapshot; machine: MachineProfileSnapshot | null }
export interface NeutralToolpathSnapshot { format: "mobi-neutral-toolpath-v1"; fingerprint: DocumentFingerprintSnapshot; plan: ToolpathPlanSnapshot; machineCode: never[] }
export interface CAMPackageSnapshot { projectId: string; fingerprint: DocumentFingerprintSnapshot; toolpath: NeutralToolpathSnapshot }
export interface CAMInput { manufacturing: ManufacturingPlanSnapshot; currentFingerprint: DocumentFingerprintSnapshot; tools: ToolSnapshot[]; machine?: MachineProfileSnapshot; explicitOperations?: ToolpathOperationSnapshot[]; failPlanning?: boolean }
export interface CAMReportEntry { stage: "VALIDATION" | "GEOMETRY" | "PLANNING" | "EXPORT"; code: string; message: string; severity: "info" | "warning" | "error"; entity: string }
export interface CAMReportSnapshot { entries: CAMReportEntry[]; startedAt: number; finishedAt: number; durationMs: number }
export interface CAMResultSnapshot { success: boolean; blocked: boolean; plan: ToolpathPlanSnapshot | null; package?: CAMPackageSnapshot; report: CAMReportSnapshot }
export interface CAMContextSnapshot { input: CAMInput; operations: ToolpathOperationSnapshot[]; plan: ToolpathPlanSnapshot | null }
export interface CAMSessionSnapshot { id: string; active: boolean }
export type CAMEventType = "CAM_STARTED" | "CAM_BLOCKED" | "TOOLPATH_VALIDATED" | "CAM_PACKAGED" | "CAM_FAILED"; export interface CAMEventSnapshot { type: CAMEventType; sessionId: string; projectId: string; logicalTimestamp: number } export type CAMListener = (event: CAMEventSnapshot) => void;
export interface GeometryFact { part: PartListItem; contour: Contour }
