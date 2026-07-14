import type { NodeCategory, SceneNodeSnapshot } from "./interfaces/PresentationTypes";
export class SceneNode {
  private readonly children: SceneNode[] = [];
  constructor(readonly id: string, readonly projectEntityId: string, readonly label: string, readonly category: NodeCategory) {
    if (!id.trim()) throw new Error("Scene node id cannot be empty");
  }
  add(node: SceneNode): void { this.children.push(node); }
  get(): SceneNodeSnapshot { return { id: this.id, projectEntityId: this.projectEntityId, label: this.label, category: this.category, children: this.children.map(child => child.get()) }; }
  ids(): string[] { return [this.id, ...this.children.flatMap(child => child.ids())]; }
}
