import type { SceneSnapshot } from "./interfaces/PresentationTypes";
import type { SceneNode } from "./SceneNode";
export class SceneModel {
  private roots: SceneNode[] = [];
  set(nodes: SceneNode[]): void { this.roots = [...nodes]; }
  clear(): void { this.roots = []; }
  get(): SceneSnapshot { return { roots: this.roots.map(node => node.get()) }; }
  ids(): string[] { return this.roots.flatMap(node => node.ids()); }
}
