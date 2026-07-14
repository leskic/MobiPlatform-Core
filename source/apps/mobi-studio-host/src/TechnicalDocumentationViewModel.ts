import type { Architecture, Project } from "../../../builder/types/ProjectTypes";

export interface TechnicalWall {
  readonly id: string;
  readonly length: number;
  readonly height: number;
  readonly thickness: number;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
}

export interface TechnicalDoor {
  readonly id: string;
  readonly hostWallId: string;
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
}

export interface TechnicalEnvironment {
  readonly id: string;
  readonly name: string;
  readonly walls: readonly TechnicalWall[];
  readonly doors: readonly TechnicalDoor[];
}

export interface TechnicalDocumentationViewModel {
  readonly projectId: string;
  readonly projectName: string;
  readonly projectCode: string;
  readonly status: string;
  readonly environments: readonly TechnicalEnvironment[];
  readonly futureSections: readonly string[];
}

export class TechnicalDocumentationFactory {
  create(project: Project): TechnicalDocumentationViewModel {
    return Object.freeze({
      projectId: project.id,
      projectName: project.displayName,
      projectCode: project.code,
      status: project.status,
      environments: project.environments.map((environment) => Object.freeze({
        id: environment.id,
        name: environment.displayName,
        walls: environment.architectures.filter(isWall).map((wall) => Object.freeze({
          id: wall.id,
          length: wall.size.width,
          height: wall.size.height,
          thickness: wall.size.depth,
          x: wall.position.x,
          y: wall.position.y,
          rotation: wall.rotation.z,
        })),
        doors: environment.architectures.filter(isDoor).map((door) => Object.freeze({
          id: door.id,
          hostWallId: door.hostId ?? "",
          width: door.size.width,
          height: door.size.height,
          x: door.position.x,
          y: door.position.y,
        })),
      })),
      futureSections: Object.freeze([
        "Vistas tecnicas",
        "Cortes",
        "Detalhamento de pecas",
        "Exportacao",
      ]),
    });
  }
}

function isWall(architecture: Architecture): boolean {
  return architecture.type === "wall";
}

function isDoor(architecture: Architecture): boolean {
  return architecture.type === "opening" && architecture.finish === "door-opening";
}

