export class SelectionSet {
  private readonly ids = new Set<string>();
  set(ids: readonly string[]): void { this.ids.clear(); ids.forEach(id => this.ids.add(id)); }
  add(id: string): void { this.ids.add(id); }
  clear(): void { this.ids.clear(); }
  has(id: string): boolean { return this.ids.has(id); }
  values(): string[] { return [...this.ids]; }
}
