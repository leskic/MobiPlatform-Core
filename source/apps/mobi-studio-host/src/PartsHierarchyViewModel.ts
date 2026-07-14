import type { Project } from "../../../builder/types/ProjectTypes";

export interface PartsHierarchyPart {
  readonly id: string;
  readonly name: string;
}

export interface PartsHierarchyModule {
  readonly id: string;
  readonly name: string;
  readonly partCount: number;
  readonly parts: readonly PartsHierarchyPart[];
}

export interface PartsHierarchyEnvironment {
  readonly id: string;
  readonly name: string;
  readonly modules: readonly PartsHierarchyModule[];
}

export interface PartsHierarchyViewModel {
  readonly projectId: string;
  readonly projectName: string;
  readonly environments: readonly PartsHierarchyEnvironment[];
  readonly expandedNodeIds: readonly string[];
  readonly selectedPartId: string | null;
}

export class PartsHierarchyFactory {
  create(project: Project, expandedNodeIds: readonly string[] = defaultExpanded(project), selectedPartId: string | null = null): PartsHierarchyViewModel {
    return Object.freeze({
      projectId: project.id,
      projectName: project.displayName,
      expandedNodeIds: Object.freeze([...expandedNodeIds]),
      selectedPartId,
      environments: project.environments.map((environment) => Object.freeze({
        id: environment.id,
        name: environment.displayName,
        modules: environment.modules.map((module) => Object.freeze({
          id: module.id,
          name: module.displayName,
          partCount: module.parts.length,
          parts: module.parts.map((part) => Object.freeze({
            id: part.id,
            name: `${part.category} / ${part.type}`,
          })),
        })),
      })),
    });
  }
}

export function defaultExpanded(project: Project): readonly string[] {
  return Object.freeze([
    project.id,
    ...project.environments.map((environment) => environment.id),
    ...project.environments.flatMap((environment) => environment.modules.map((module) => module.id)),
  ]);
}

export function toggleExpanded(expanded: readonly string[], nodeId: string): readonly string[] {
  return expanded.includes(nodeId)
    ? Object.freeze(expanded.filter((id) => id !== nodeId))
    : Object.freeze([...expanded, nodeId]);
}

