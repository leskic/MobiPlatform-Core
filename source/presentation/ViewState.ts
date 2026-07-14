import type { ViewSnapshot } from "./interfaces/PresentationTypes";
export class ViewState {
  private state: ViewSnapshot = { exploded: false, sections: false, wireframe: false, shadows: true, materials: true, mode: "inspection" };
  set(values: Partial<ViewSnapshot>): void { this.state = { ...this.state, ...values }; }
  get(): ViewSnapshot { return structuredClone(this.state); }
}
