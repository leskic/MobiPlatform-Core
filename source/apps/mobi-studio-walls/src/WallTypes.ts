import type { Architecture, Vector3 } from "../../../builder/types/ProjectTypes";
export type WallOperation = "CREATE_WALL"|"UPDATE_WALL"|"DELETE_WALL"|"MERGE_WALLS"|"SPLIT_WALL"|"CONNECT_WALLS_L"|"CONNECT_WALLS_T"|"CONNECT_WALLS_X";
export interface WallDescriptor { id:string; environmentId:string; start:Vector3; end:Vector3; height:number; thickness:number; finish:string }
export interface WallResult { success:boolean; code:string; transaction?:unknown; walls?:Architecture[] }
export interface WallPreview { operation:WallOperation; walls:WallDescriptor[] }
