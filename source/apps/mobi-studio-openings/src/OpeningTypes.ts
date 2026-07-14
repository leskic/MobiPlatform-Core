import type { Architecture } from "../../../builder/types/ProjectTypes";

export type OpeningOperation = "CREATE_OPENING" | "UPDATE_OPENING" | "DELETE_OPENING" | "MOVE_OPENING" | "RESIZE_OPENING" | "REHOST_OPENING";

export interface OpeningDescriptor {
  id: string;
  environmentId: string;
  hostWallId: string;
  offset: number;
  sillHeight: number;
  width: number;
  height: number;
  finish: string;
}

export type OpeningValidationCode = "OPENING_WITHOUT_WALL" | "OPENING_OUT_OF_BOUNDS" | "OPENING_PARTIALLY_OUTSIDE_WALL" | "OPENING_OVERLAP" | "INVALID_OPENING_DIMENSIONS" | "DUPLICATE_OPENING";
export interface OpeningIssue { code: OpeningValidationCode; openingIds: string[]; path: string }
export interface OpeningValidationResult { valid: boolean; issues: OpeningIssue[] }
export interface OpeningResult { success: boolean; code: string; validation?: OpeningValidationResult; transaction?: unknown; opening?: Architecture }
export interface OpeningHistoryEntry { before: Architecture[]; after: Architecture[] }

