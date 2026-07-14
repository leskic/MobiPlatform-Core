import type {
  ProductionFeedbackEvent,
  ProductionFeedbackStream,
} from "../industrial-integration/IndustrialContracts";
import type { TelemetryMonitorState } from "./TelemetryMonitorState";

export class TelemetryMonitorConsumer {
  private events: ProductionFeedbackEvent[] = [];
  private unsubscribe: (() => void) | undefined;
  private sequence = 0;

  connect(stream: ProductionFeedbackStream): TelemetryMonitorState {
    if (this.unsubscribe) throw new Error("TELEMETRY_MONITOR_CONNECTED");
    this.events = [...structuredClone(stream.snapshot())];
    this.unsubscribe = stream.subscribe((event) => {
      this.events = [...this.events, structuredClone(event)];
      this.sequence += 1;
    });
    this.sequence += 1;
    return this.snapshot();
  }

  disconnect(): TelemetryMonitorState {
    if (!this.unsubscribe) throw new Error("TELEMETRY_MONITOR_DISCONNECTED");
    this.unsubscribe();
    this.unsubscribe = undefined;
    this.events = [];
    this.sequence += 1;
    return this.snapshot();
  }

  snapshot(): TelemetryMonitorState {
    return {
      status: this.unsubscribe ? "CONNECTED" : "DISCONNECTED",
      eventSequence: this.sequence,
      events: structuredClone(this.events),
    };
  }
}
