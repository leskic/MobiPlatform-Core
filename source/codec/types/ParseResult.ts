import type { Project } from "../../builder/types/ProjectTypes";
import type { CodecError } from "./CodecError";

export type ParseResult =
  | { success: true; project: Project }
  | { success: false; error: CodecError };
