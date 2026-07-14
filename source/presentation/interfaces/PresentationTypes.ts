export type NodeCategory = "project" | "environment" | "architecture" | "infrastructure" | "module" | "part" | "hardware";
export interface SceneNodeSnapshot { id: string; projectEntityId: string; label: string; category: NodeCategory; children: SceneNodeSnapshot[] }
export interface SceneSnapshot { roots: SceneNodeSnapshot[] }
export interface SelectionSnapshot { ids: string[] }
export interface VisibilitySnapshot { hidden: string[]; isolated: string[]; layers: Record<string, boolean>; groups: Record<string, boolean>; categories: Record<string, boolean> }
export type Projection = "orthographic" | "perspective";
export interface Vector3State { x: number; y: number; z: number }
export interface CameraSnapshot { position: Vector3State; target: Vector3State; zoom: number; projection: Projection; namedViews: Record<string, Omit<CameraSnapshot, "namedViews">> }
export interface ViewSnapshot { exploded: boolean; sections: boolean; wireframe: boolean; shadows: boolean; materials: boolean; mode: "inspection" | "production" }
export type PresentationEventType = "SelectionChanged" | "VisibilityChanged" | "CameraChanged" | "ViewChanged" | "SceneChanged";
export interface PresentationEventSnapshot { type: PresentationEventType; sessionId: string; logicalTimestamp: number }
export type PresentationListener = (event: PresentationEventSnapshot) => void;
export interface PresentationSessionSnapshot { id: string; active: boolean }
export interface PresentationSnapshot { scene: SceneSnapshot; selection: SelectionSnapshot; visibility: VisibilitySnapshot; camera: CameraSnapshot; view: ViewSnapshot }
