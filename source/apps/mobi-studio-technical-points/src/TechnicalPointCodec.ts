import type { Infrastructure } from "../../../builder/types/ProjectTypes";
import type { TechnicalPointDescriptor, TechnicalPointKind } from "./TechnicalPointTypes";
const PREFIX="technical:";
export function toInfrastructure(point:TechnicalPointDescriptor):Infrastructure{if(!point.hostSurfaceId)throw new Error("TECHNICAL_POINT_WITHOUT_SURFACE");return{id:point.id,parentId:point.environmentId,hostId:point.hostSurfaceId,category:point.category,type:`${PREFIX}${point.kind}${point.kind==="custom"?`:${point.customType??"custom"}`:""}`,position:structuredClone(point.position),installationVolume:{width:0,height:0,depth:0}}}
export function fromInfrastructure(value:Infrastructure):TechnicalPointDescriptor{const parts=value.type.split(":"),kind=(parts[1]??"custom") as TechnicalPointKind;return{id:value.id,environmentId:value.parentId,hostSurfaceId:value.hostId??"",kind,category:value.category,position:structuredClone(value.position),...(kind==="custom"?{customType:parts.slice(2).join(":")||"custom"}:{})}}
export const isTechnicalPoint=(value:Infrastructure)=>value.type.startsWith(PREFIX);
