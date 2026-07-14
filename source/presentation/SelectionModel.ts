import type { SelectionSnapshot } from "./interfaces/PresentationTypes";
import { SelectionSet } from "./SelectionSet";
export class SelectionModel {
  private readonly selection = new SelectionSet();
  select(id: string): void { this.selection.set([id]); }
  selectMany(ids: readonly string[]): void { this.selection.set(ids); }
  add(id: string): void { this.selection.add(id); }
  clear(): void { this.selection.clear(); }
  invert(allIds: readonly string[]): void { this.selection.set(allIds.filter(id => !this.selection.has(id))); }
  get(): SelectionSnapshot { return { ids: this.selection.values() }; }
}
