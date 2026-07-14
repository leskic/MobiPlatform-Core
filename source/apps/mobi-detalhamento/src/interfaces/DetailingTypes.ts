import type { Project } from "../../../../builder/types/ProjectTypes"; import type { PresentationSnapshot } from "../../../../presentation/interfaces/PresentationTypes"; import type { RuleResult } from "../../../../copilot/rules/RuleResult";
export type ViewKind = "FRONT" | "REAR" | "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "ISOMETRIC" | "EXPLODED" | "SECTION";
export interface TechnicalView { id: string; kind: ViewKind; presentation: PresentationSnapshot; sectionId?: string }
export interface Dimension { id: string; type: "linear" | "external" | "internal" | "automatic" | "manual"; value: number; unit: "mm"; note?: string }
export interface Annotation { id: string; type: "callout" | "label" | "part-code"; text: string; entityId: string }
export interface SheetLayoutSnapshot { width: number; height: number; margin: number; scale: number; titleBlock: string }
export interface TechnicalSheet { id: string; number: number; title: string; revision: string; layout: SheetLayoutSnapshot; views: TechnicalView[]; dimensions: Dimension[]; annotations: Annotation[] }
export interface PartListItem { id: string; materialId: string; width: number; height: number; thickness: number; quantity: number }
export interface HardwareListItem { id: string; catalogId: string; quantity: number }
export interface MaterialListItem { materialId: string; totalParts: number }
export interface CuttingReport { parts: PartListItem[]; totalArea: number }
export interface DocumentFingerprintSnapshot { algorithm: "sha256"; value: string; version: "1.0.0"; logicalTimestamp: number; projectId: string }
export interface TechnicalDocument { format: "PDF" | "SVG"; projectId: string; version: "1.0.0"; logicalTimestamp: number; fingerprint: DocumentFingerprintSnapshot; status: "CURRENT" | "OBSOLETE"; sheets: TechnicalSheet[]; content: string }
export interface PrintPackageSnapshot { projectId: string; fingerprint: DocumentFingerprintSnapshot; pdf: TechnicalDocument; svg: TechnicalDocument; parts: PartListItem[]; hardware: HardwareListItem[]; materials: MaterialListItem[]; cutting: CuttingReport; labels: Annotation[] }
export interface DetailingReportEntry { stage: "VALIDATION" | "PRODUCTION" | "COMPOSITION" | "EXPORT"; code: string; message: string; severity: "info" | "warning" | "error"; entity: string }
export interface DetailingReportSnapshot { entries: DetailingReportEntry[]; productionIssues: RuleResult[]; startedAt: number; finishedAt: number; durationMs: number }
export interface DetailingInput { project: Project; presentation: PresentationSnapshot; revision: string; logicalTimestamp: number; existingFingerprint?: DocumentFingerprintSnapshot }
export interface DetailingResultSnapshot { success: boolean; obsolete: boolean; fingerprint: DocumentFingerprintSnapshot; sheets: TechnicalSheet[]; package?: PrintPackageSnapshot; report: DetailingReportSnapshot }
export interface DetailingContextSnapshot { input: DetailingInput; fingerprint: DocumentFingerprintSnapshot | null; sheets: TechnicalSheet[] }
export interface DetailingSessionSnapshot { id: string; active: boolean }
export type DetailingEventType = "DETAILING_STARTED" | "SHEETS_COMPOSED" | "DOCUMENT_EXPORTED" | "DOCUMENT_OBSOLETE" | "DETAILING_FAILED";
export interface DetailingEventSnapshot { type: DetailingEventType; sessionId: string; logicalTimestamp: number; projectId: string }
export type DetailingListener = (event: DetailingEventSnapshot) => void;
