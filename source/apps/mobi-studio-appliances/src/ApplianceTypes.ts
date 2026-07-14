import type{InfrastructureCategory,Size3D,Vector3}from"../../../builder/types/ProjectTypes";
export type ApplianceKind="refrigerator"|"cooktop"|"oven"|"microwave"|"dishwasher"|"washing_machine"|"television"|"hood"|"air_purifier"|"generic";
export interface ApplianceDescriptor{id:string;clearanceId:string;environmentId:string;kind:ApplianceKind;category:InfrastructureCategory;position:Vector3;collisionVolume:Size3D;clearanceVolume:Size3D;hostSurfaceId?:string}
export type CollisionCode="APPLIANCE_COLLISION_WALL"|"APPLIANCE_COLLISION_APPLIANCE"|"CLEARANCE_INSUFFICIENT"|"APPLIANCE_OVERLAP"|"APPLIANCE_OUTSIDE_ENVIRONMENT"|"APPLIANCE_BLOCKS_OPENING"|"APPLIANCE_INVADES_WALL"|"APPLIANCE_PARTIALLY_EXTERNAL"|"INVALID_APPLIANCE_VOLUME"|"APPLIANCE_HOST_NOT_FOUND";
export interface CollisionIssue{code:CollisionCode;ids:string[];path:string}
export interface CollisionResult{valid:boolean;issues:CollisionIssue[]}
export interface ApplianceResult{success:boolean;code:string;collision?:CollisionResult;transaction?:unknown}

