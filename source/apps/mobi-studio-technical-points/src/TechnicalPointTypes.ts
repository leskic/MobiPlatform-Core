import type { InfrastructureCategory, Vector3 } from "../../../builder/types/ProjectTypes";
export type TechnicalPointKind = "outlet"|"switch"|"lighting"|"cold_water"|"hot_water"|"sewer"|"gas"|"internet"|"tv"|"exhaust"|"drain"|"custom";
export interface TechnicalPointDescriptor { id:string; environmentId:string; hostSurfaceId:string; kind:TechnicalPointKind; category:InfrastructureCategory; position:Vector3; customType?:string }
export interface TechnicalPointIssue { code:"TECHNICAL_POINT_WITHOUT_SURFACE"|"INVALID_HOST_SURFACE"|"TECHNICAL_POINT_OUT_OF_SURFACE"|"INVALID_TECHNICAL_CATEGORY"|"DUPLICATE_TECHNICAL_POINT"; ids:string[]; path:string }
export interface TechnicalPointValidation { valid:boolean; issues:TechnicalPointIssue[] }
export interface TechnicalPointResult { success:boolean; code:string; validation?:TechnicalPointValidation; transaction?:unknown }

