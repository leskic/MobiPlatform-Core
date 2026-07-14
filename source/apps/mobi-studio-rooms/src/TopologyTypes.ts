import type { Vector3 } from "../../../builder/types/ProjectTypes";
export interface Segment{id:string;start:Vector3;end:Vector3}
export type TopologyCode="ZERO_LENGTH_SEGMENT"|"DUPLICATE_WALL"|"OVERLAPPING_WALLS"|"OPEN_LOOP"|"SELF_INTERSECTION"|"ILLEGAL_INTERSECTION"|"AMBIGUOUS_LOOPS"|"MISSING_REFERENCE"|"DUPLICATE_ROOM";
export interface TopologyIssue{code:TopologyCode;wallIds:string[];path:string}
export interface TopologyResult{valid:boolean;issues:TopologyIssue[];orderedWallIds:string[]}
export interface RoomDescriptor{environmentId:string;wallIds:string[];displayName:string;code:string}
export interface RoomResult{success:boolean;code:string;topology?:TopologyResult;transaction?:unknown}
