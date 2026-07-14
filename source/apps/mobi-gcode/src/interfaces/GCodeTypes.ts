import type { CAMPackageSnapshot, OperationType, ToolpathOperationSnapshot } from "../../../mobi-cam/src/interfaces/CAMTypes";

export type ControllerType = "FANUC" | "HOMAG" | "BIESSE" | "SCM" | "MORBIDELLI" | "SIEMENS";
export interface GCodeMachineProfile { id: string; displayName: string; controller: ControllerType; supportedOperations: OperationType[]; version: string }
export interface GCodeInput { camPackage: CAMPackageSnapshot; currentFingerprint: string; machineProfileId: string; logicalTimestamp: number }
export interface GCodeFile { name: string; controller: ControllerType; content: string; projectId: string; fingerprint: string; version: string; logicalTimestamp: number; machineProfileId: string }
export interface GCodePackageSnapshot { projectId: string; fingerprint: string; machineProfile: GCodeMachineProfile; files: GCodeFile[] }
export type GCodeStage = "READ" | "VALIDATE" | "GENERATE" | "DRY_RUN" | "EXPORT";
export interface GCodeReportEntry { stage: GCodeStage; code: string; message: string; severity: "info" | "error"; entity: string }
export interface GCodeReportSnapshot { entries: GCodeReportEntry[]; startedAt: number; finishedAt: number; durationMs: number }
export interface GCodeResultSnapshot { success: boolean; blocked: boolean; package: GCodePackageSnapshot | null; report: GCodeReportSnapshot }
export interface GCodeSessionSnapshot { id: string; active: boolean }
export interface GCodeContextSnapshot { input: GCodeInput; profile: GCodeMachineProfile | null; operations: ToolpathOperationSnapshot[]; output: GCodePackageSnapshot | null }
export type GCodeEventType = "GCODE_STARTED" | "GCODE_BLOCKED" | "GCODE_VALIDATED" | "GCODE_EXPORTED" | "GCODE_FAILED";
export interface GCodeEventSnapshot { type: GCodeEventType; sessionId: string; projectId: string; logicalTimestamp: number }
export type GCodeListener = (event: GCodeEventSnapshot) => void;
export interface PostProcessor { readonly controller: ControllerType; process(input: CAMPackageSnapshot, profile: GCodeMachineProfile, logicalTimestamp: number): GCodeFile }
