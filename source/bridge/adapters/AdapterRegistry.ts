export interface BridgeExportAdapter {
  readonly id: string;
  export(): string;
}

export class AdapterRegistry {
  private readonly adapters = new Map<string, BridgeExportAdapter>();

  register(adapter: BridgeExportAdapter): void {
    if (this.adapters.has(adapter.id)) {
      throw new Error(`Bridge adapter already registered: ${adapter.id}`);
    }
    this.adapters.set(adapter.id, adapter);
  }

  get(id: string): BridgeExportAdapter | undefined {
    return this.adapters.get(id);
  }

  list(): BridgeExportAdapter[] {
    return [...this.adapters.values()];
  }
}
