import type { Group } from "three";
import type { VisibilitySnapshot } from "../presentation/interfaces/PresentationTypes";

export class VisibilityRenderer {
  apply(objects: readonly Group[], state: VisibilitySnapshot): void {
    const hidden = new Set(state.hidden); const isolated = new Set(state.isolated);
    for (const object of objects) {
      const id = object.userData.nodeId as string | undefined;
      const category = object.userData.category as string | undefined;
      const layer = object.userData.layerId as string | undefined;
      const group = object.userData.groupId as string | undefined;
      object.visible = id !== undefined && !hidden.has(id)
        && (isolated.size === 0 || isolated.has(id))
        && (category === undefined || state.categories[category] !== false)
        && (layer === undefined || state.layers[layer] !== false)
        && (group === undefined || state.groups[group] !== false);
    }
  }
}
