import type { StudioEvent, StudioListener } from "./types/StudioTypes";

export class StudioEvents {
  private readonly listeners = new Set<StudioListener>();

  subscribe(listener: StudioListener): void {
    this.listeners.add(listener);
  }

  unsubscribe(listener: StudioListener): void {
    this.listeners.delete(listener);
  }

  notify(event: StudioEvent): void {
    for (const listener of this.listeners) listener(structuredClone(event));
  }
}
