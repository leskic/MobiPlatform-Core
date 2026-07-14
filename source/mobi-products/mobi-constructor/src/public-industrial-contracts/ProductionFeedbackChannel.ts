import type {
  ProductionFeedbackEvent,
  ProductionFeedbackStream,
} from "./MICContracts";

export class ProductionFeedbackChannel implements ProductionFeedbackStream {
  private readonly events: ProductionFeedbackEvent[] = [];
  private readonly listeners = new Set<(event: ProductionFeedbackEvent) => void>();

  publish(event: ProductionFeedbackEvent): void {
    this.events.push(structuredClone(event));
    for (const listener of this.listeners) listener(structuredClone(event));
  }

  subscribe(listener: (event: ProductionFeedbackEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  snapshot(): readonly ProductionFeedbackEvent[] {
    return structuredClone(this.events);
  }
}
