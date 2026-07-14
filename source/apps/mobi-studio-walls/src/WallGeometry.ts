import type { Architecture, Vector3 } from "../../../builder/types/ProjectTypes";
import type { WallDescriptor } from "./WallTypes";
const EPS=1e-7;
export const samePoint=(a:Vector3,b:Vector3)=>Math.abs(a.x-b.x)<EPS&&Math.abs(a.y-b.y)<EPS&&Math.abs(a.z-b.z)<EPS;
export function wallLength(a:Vector3,b:Vector3):number{return Math.hypot(b.x-a.x,b.z-a.z)}
export function toArchitecture(w:WallDescriptor):Architecture{const length=wallLength(w.start,w.end);if(length<EPS)throw new Error("ZERO_LENGTH_WALL");if(w.height<=0||w.thickness<=0)throw new Error("INVALID_WALL_DIMENSIONS");return{id:w.id,parentId:w.environmentId,type:"wall",size:{width:length,height:w.height,depth:w.thickness},position:structuredClone(w.start),rotation:{x:0,y:Math.atan2(w.end.z-w.start.z,w.end.x-w.start.x)*180/Math.PI,z:0},referencePlane:structuredClone(w.end),finish:w.finish}}
export function fromArchitecture(w:Architecture):WallDescriptor{return{id:w.id,environmentId:w.parentId,start:structuredClone(w.position),end:structuredClone(w.referencePlane),height:w.size.height,thickness:w.size.depth,finish:w.finish}}
export function collinear(a:WallDescriptor,b:WallDescriptor):boolean{const ax=a.end.x-a.start.x,az=a.end.z-a.start.z,bx=b.end.x-b.start.x,bz=b.end.z-b.start.z;return Math.abs(ax*bz-az*bx)<EPS}
export function connectEndpoint(wall:WallDescriptor,point:Vector3):WallDescriptor{const startDistance=wallLength(wall.start,point),endDistance=wallLength(wall.end,point);return startDistance<=endDistance?{...wall,start:structuredClone(point)}:{...wall,end:structuredClone(point)}}
