import type { Architecture, Environment } from "../../../builder/types/ProjectTypes";
import { wallLength, fromArchitecture as wallFromArchitecture } from "../../mobi-studio-walls/src/WallGeometry";
import { fromOpeningArchitecture } from "./OpeningGeometry";
import type { OpeningDescriptor, OpeningIssue, OpeningValidationCode, OpeningValidationResult } from "./OpeningTypes";

const EPS = 1e-7;
export class OpeningValidator {
  validateDescriptor(environment: Environment, opening: OpeningDescriptor, ignoreId?: string): OpeningValidationResult {
    const issues: OpeningIssue[] = [], wall = environment.architectures.find(value => value.id === opening.hostWallId && value.type === "wall");
    if (!opening.hostWallId || !wall) return { valid: false, issues: [this.issue("OPENING_WITHOUT_WALL", [opening.id])] };
    if (opening.width <= 0 || opening.height <= 0 || opening.sillHeight < 0) issues.push(this.issue("INVALID_OPENING_DIMENSIONS", [opening.id]));
    const length = wallLength(wallFromArchitecture(wall).start, wallFromArchitecture(wall).end);
    if (opening.offset < -EPS || opening.offset > length + EPS) issues.push(this.issue("OPENING_OUT_OF_BOUNDS", [opening.id]));
    if (opening.offset < -EPS || opening.offset + opening.width > length + EPS || opening.sillHeight + opening.height > wall.size.height + EPS) issues.push(this.issue("OPENING_PARTIALLY_OUTSIDE_WALL", [opening.id]));
    const siblings = environment.architectures.filter(value => value.type === "opening" && value.id !== ignoreId && value.hostId === opening.hostWallId);
    if (environment.architectures.some(value => value.id === opening.id && value.id !== ignoreId)) issues.push(this.issue("DUPLICATE_OPENING", [opening.id]));
    for (const sibling of siblings) {
      const other = fromOpeningArchitecture(sibling, wall);
      if (this.overlaps(opening.offset, opening.offset + opening.width, other.offset, other.offset + other.width) && this.overlaps(opening.sillHeight, opening.sillHeight + opening.height, other.sillHeight, other.sillHeight + other.height)) issues.push(this.issue("OPENING_OVERLAP", [opening.id, sibling.id]));
    }
    return { valid: issues.length === 0, issues: this.unique(issues) };
  }
  validateEnvironment(environment: Environment): OpeningValidationResult {
    const issues = environment.architectures.filter(value => value.type === "opening").flatMap(opening => {
      const wall = environment.architectures.find(value => value.id === opening.hostId && value.type === "wall");
      if (!wall) return [this.issue("OPENING_WITHOUT_WALL", [opening.id])];
      return this.validateDescriptor(environment, fromOpeningArchitecture(opening, wall), opening.id).issues;
    });
    return { valid: issues.length === 0, issues: this.unique(issues) };
  }
  private overlaps(a0: number, a1: number, b0: number, b1: number): boolean { return Math.min(a1, b1) - Math.max(a0, b0) > EPS; }
  private issue(code: OpeningValidationCode, ids: string[]): OpeningIssue { return { code, openingIds: ids, path: "/architectures" }; }
  private unique(issues: OpeningIssue[]): OpeningIssue[] { const seen = new Set<string>(); return issues.filter(issue => { const key = `${issue.code}:${issue.openingIds.join(",")}`; if (seen.has(key)) return false; seen.add(key); return true; }); }
}

