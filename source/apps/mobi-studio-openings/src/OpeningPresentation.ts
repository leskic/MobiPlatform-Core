import type { Project } from "../../../builder/types/ProjectTypes";
import type { PresentationCore } from "../../../presentation/PresentationCore";
import { SceneNode } from "../../../presentation/SceneNode";

export class OpeningPresentation {
  constructor(private readonly presentation: PresentationCore) {}
  sync(project: Project, logicalTimestamp: number): void {
    const walls = project.environments.flatMap(environment => environment.architectures.filter(entity => entity.type === "wall").map(wall => {
      const node = new SceneNode(`architecture:${wall.id}`, wall.id, "Wall", "architecture");
      for (const opening of environment.architectures.filter(entity => entity.type === "opening" && entity.hostId === wall.id)) node.add(new SceneNode(`architecture:${opening.id}`, opening.id, "Opening", "architecture"));
      return node;
    }));
    this.presentation.repository.scene.set(walls);
    this.presentation.controller.notify("SceneChanged", logicalTimestamp);
  }
}
