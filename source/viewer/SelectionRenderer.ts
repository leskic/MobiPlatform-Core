import type { Group } from "three";
import type { SelectionSnapshot } from "../presentation/interfaces/PresentationTypes";

export class SelectionRenderer {
  private hoverId: string | undefined;
  setHover(id: string | undefined): void { this.hoverId = id; }
  apply(objects: readonly Group[], selection: SelectionSnapshot): void {
    const selected = new Set(selection.ids);
    for (const object of objects) {
      const id = object.userData.nodeId as string | undefined;
      object.userData.selected = id !== undefined && selected.has(id);
      object.userData.hovered = id !== undefined && id === this.hoverId;
      object.traverse(child => {
        if ("material" in child) {
          const material = child.material;
          const materials = Array.isArray(material) ? material : [material];
          for (const item of materials) if (item && "emissive" in item) {
            const emissive = item.emissive;
            if (emissive && typeof emissive.setHex === "function") emissive.setHex(object.userData.selected ? 0x3366ff : object.userData.hovered ? 0x666666 : 0x000000);
          }
        }
      });
    }
  }
}
