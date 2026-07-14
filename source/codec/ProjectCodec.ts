import { ProjectParser } from "./ProjectParser";
import { ProjectSerializer } from "./ProjectSerializer";
import type { ParseResult } from "./types/ParseResult";

export class ProjectCodec {
  static parse(input: string): ParseResult {
    return ProjectParser.parse(input);
  }

  static serialize(project: unknown): string {
    return ProjectSerializer.serialize(project);
  }
}
