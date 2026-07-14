import type { Architecture, Environment, EnvironmentInput, Hardware, Infrastructure, Module, ModuleInput, Part, Project, ProjectInput } from "../../../../builder/types/ProjectTypes";
import type { TransactionRequestSnapshot } from "../../../../orchestrator/interfaces/OrchestratorTypes";
import type { ValidationError } from "../../../../validator/types/ValidationError";
import type { RuleResult } from "../../../../copilot/rules/RuleResult";

export interface EnvironmentDescriptor { environment: EnvironmentInput; architectures?: readonly Architecture[]; infrastructures?: readonly Infrastructure[]; modules?: readonly ModuleDescriptor[] }
export interface ModuleDescriptor { module: ModuleInput; parts?: readonly Part[]; hardwares?: readonly Hardware[] }
export interface ConstructionDescriptor { project: ProjectInput; environments?: readonly EnvironmentDescriptor[] }
export interface ConstructionInput { descriptor: ConstructionDescriptor; transactionId: string; logicalTimestamp: number }
export type ConstructionStage = "INPUT_MAPPING" | "BUILD" | "SCHEMA_VALIDATION" | "RULE_VALIDATION" | "COMMIT";
export type ConstructionSeverity = "info" | "warning" | "error";
export interface ConstructionReportEntry { stage: ConstructionStage; rule: string | null; code: string; message: string; entity: string; severity: ConstructionSeverity; durationMs: number }
export interface ConstructorReportSnapshot { entries: ConstructionReportEntry[]; startedAt: number; finishedAt: number; durationMs: number }
export interface ConstructorResultSnapshot { success: boolean; failures: ConstructionReportEntry[]; warnings: ConstructionReportEntry[]; entity?: Project; report: ConstructorReportSnapshot; transactionRequest?: TransactionRequestSnapshot }
export interface MappedConstruction { project: ProjectInput; environments: Array<{ environment: EnvironmentInput; architectures: Architecture[]; infrastructures: Infrastructure[]; modules: Array<{ module: ModuleInput; parts: Part[]; hardwares: Hardware[] }> }> }
export interface ConstructionValidation { schemaErrors: ValidationError[]; ruleResults: RuleResult[] }
export type ConstructorEventType = "CONSTRUCTION_STARTED" | "STAGE_COMPLETED" | "CONSTRUCTION_SUCCEEDED" | "CONSTRUCTION_FAILED";
export interface ConstructorEventSnapshot { type: ConstructorEventType; sessionId: string; stage?: ConstructionStage; logicalTimestamp: number }
export type ConstructorListener = (event: ConstructorEventSnapshot) => void;
export interface ConstructorSessionSnapshot { id: string; active: boolean }
export type EntityUnion = Project | Environment | Architecture | Infrastructure | Module | Part | Hardware;
