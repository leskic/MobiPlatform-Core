import type { ProductionFeedbackEvent } from "../industrial-integration/IndustrialContracts";

export interface TelemetryMonitorState {
  readonly status: "DISCONNECTED" | "CONNECTED";
  readonly eventSequence: number;
  readonly events: readonly ProductionFeedbackEvent[];
}
