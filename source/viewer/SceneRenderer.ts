import { Group, Mesh, Scene, type Object3D } from "three";
import type { SceneNodeSnapshot, SceneSnapshot, ViewSnapshot } from "../presentation/interfaces/PresentationTypes";
import type { GeometrySource, SceneUpdateResult } from "./interfaces/ViewerTypes";
import type { GeometryCache } from "./GeometryCache";
import type { MaterialManager } from "./MaterialManager";

export class SceneRenderer {
  readonly scene = new Scene();
  private readonly objects = new Map<string, Group>();
  private lastExploded = false;

  constructor(private readonly cache: GeometryCache, private readonly materials: MaterialManager, private readonly source?: GeometrySource) {}

  update(snapshot: SceneSnapshot, view: ViewSnapshot): SceneUpdateResult {
    const next = new Set<string>(); const added: string[] = []; const updated: string[] = [];
    const visit = (node: SceneNodeSnapshot, parent: Object3D, depth: number): void => {
      next.add(node.id);
      let object = this.objects.get(node.id);
      if (!object) {
        object = new Group(); object.name = node.label;
        object.userData = { nodeId: node.id, projectEntityId: node.projectEntityId, category: node.category };
        const geometry = this.cache.get(node.projectEntityId) ?? this.source?.get(node);
        if (geometry) {
          if (!this.cache.has(node.projectEntityId)) this.cache.set(node.projectEntityId, geometry);
          object.add(new Mesh(geometry));
        }
        this.objects.set(node.id, object); added.push(node.id);
      } else {
        object.name = node.label; object.userData.projectEntityId = node.projectEntityId; object.userData.category = node.category; updated.push(node.id);
      }
      if (object.parent !== parent) parent.add(object);
      object.position.x = view.exploded ? depth * 25 : 0;
      object.traverse(child => { if (child instanceof Mesh) this.materials.apply(child, view); });
      for (const child of node.children) visit(child, object, depth + 1);
    };
    for (const root of snapshot.roots) visit(root, this.scene, 0);
    const removed: string[] = [];
    for (const [id, object] of this.objects) if (!next.has(id)) { object.removeFromParent(); this.objects.delete(id); removed.push(id); }
    this.scene.userData.sections = view.sections; this.scene.userData.mode = view.mode;
    this.lastExploded = view.exploded;
    return { added, updated, removed };
  }

  get(id: string): Group | undefined { return this.objects.get(id); }
  ids(): string[] { return [...this.objects.keys()]; }
  values(): Group[] { return [...this.objects.values()]; }
  isExploded(): boolean { return this.lastExploded; }
  clear(): void { for (const object of this.objects.values()) object.removeFromParent(); this.objects.clear(); }
}
