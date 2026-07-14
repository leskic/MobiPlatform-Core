import type { VisibilitySnapshot } from "./interfaces/PresentationTypes";
export class VisibilityState {
  private hidden = new Set<string>(); private isolated = new Set<string>();
  private layers: Record<string, boolean> = {}; private groups: Record<string, boolean> = {}; private categories: Record<string, boolean> = {};
  show(id: string): void { this.hidden.delete(id); }
  hide(id: string): void { this.hidden.add(id); }
  isolate(ids: readonly string[]): void { this.isolated = new Set(ids); }
  restore(): void { this.hidden.clear(); this.isolated.clear(); }
  setLayer(id: string, visible: boolean): void { this.layers[id] = visible; }
  setGroup(id: string, visible: boolean): void { this.groups[id] = visible; }
  setCategory(id: string, visible: boolean): void { this.categories[id] = visible; }
  get(): VisibilitySnapshot { return structuredClone({ hidden: [...this.hidden], isolated: [...this.isolated], layers: this.layers, groups: this.groups, categories: this.categories }); }
}
