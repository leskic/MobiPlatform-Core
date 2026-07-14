import { ProjectParser } from "../../../codec/ProjectParser";
import type { Project } from "../../../builder/types/ProjectTypes";

export interface LoadedProject {
  readonly fileName: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly project: Project;
  readonly source: string;
}

export interface ProjectFileLoadSuccess {
  readonly success: true;
  readonly project: LoadedProject;
}

export interface ProjectFileLoadFailure {
  readonly success: false;
  readonly code: string;
  readonly message: string;
}

export type ProjectFileLoadResult = ProjectFileLoadSuccess | ProjectFileLoadFailure;

export class ProjectFileLoader {
  async loadFile(file: File): Promise<ProjectFileLoadResult> {
    return this.loadText(await file.text(), file.name);
  }

  loadText(source: string, fileName = "Projeto.mobi"): ProjectFileLoadResult {
    const parsed = ProjectParser.parse(source);
    if (!parsed.success) {
      return Object.freeze({
        success: false,
        code: parsed.error.code,
        message: parsed.error.message,
      });
    }

    return Object.freeze({
      success: true,
      project: Object.freeze({
        fileName,
        projectId: parsed.project.id,
        projectName: parsed.project.displayName,
        project: parsed.project,
        source,
      }),
    });
  }
}
