import type { Part, Project } from "../../../builder/types/ProjectTypes";

export interface PartFoundationItem {
  readonly id: string;
  readonly moduleId: string;
  readonly moduleName: string;
  readonly type: string;
  readonly category: string;
  readonly width: number;
  readonly height: number;
  readonly thickness: number;
  readonly materialId: string;
}

export interface PartsFoundationViewModel {
  readonly projectId: string;
  readonly projectName: string;
  readonly totalParts: number;
  readonly parts: readonly PartFoundationItem[];
}

export class PartsFoundationFactory {
  create(project: Project): PartsFoundationViewModel {
    const parts = project.environments.flatMap((environment) =>
      environment.modules.flatMap((module) =>
        module.parts.map((part) => this.part(part, module.id, module.displayName))
      )
    );

    return Object.freeze({
      projectId: project.id,
      projectName: project.displayName,
      totalParts: parts.length,
      parts: Object.freeze(parts),
    });
  }

  private part(part: Part, moduleId: string, moduleName: string): PartFoundationItem {
    return Object.freeze({
      id: part.id,
      moduleId,
      moduleName,
      type: part.type,
      category: part.category,
      width: part.size.width,
      height: part.size.height,
      thickness: part.size.thickness,
      materialId: part.materialId,
    });
  }
}

