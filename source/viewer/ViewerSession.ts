export class ViewerSession {
  private id: string | undefined;
  open(id: string): void { if (!id.trim()) throw new Error("Viewer session id cannot be empty"); this.id = id; }
  close(): void { if (!this.id) throw new Error("No viewer session"); this.id = undefined; }
  require(): string { if (!this.id) throw new Error("No viewer session"); return this.id; }
  isActive(): boolean { return this.id !== undefined; }
}
