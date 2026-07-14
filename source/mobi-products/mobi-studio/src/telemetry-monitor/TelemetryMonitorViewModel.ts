import type { ProductionFeedbackEvent } from "../industrial-integration/IndustrialContracts";

export interface TelemetryMonitorViewModel {
  readonly component: "TELEMETRY_MONITOR";
  readonly connected: boolean;
  readonly events: readonly ProductionFeedbackEvent[];
}

export interface TelemetryMonitorRenderer {
  render(viewModel: TelemetryMonitorViewModel): void;
}
