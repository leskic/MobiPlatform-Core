import type { ProductionFeedbackStream } from "../industrial-integration/IndustrialContracts";
import { TelemetryFilter, type TelemetryFilterOptions } from "./TelemetryFilter";
import { TelemetryMonitorConsumer } from "./TelemetryMonitorConsumer";
import type { TelemetryMonitorState } from "./TelemetryMonitorState";
import type {
  TelemetryMonitorRenderer,
  TelemetryMonitorViewModel,
} from "./TelemetryMonitorViewModel";

export class TelemetryMonitorController {
  constructor(
    private readonly consumer = new TelemetryMonitorConsumer(),
    private readonly filter = new TelemetryFilter(),
    private readonly renderer?: TelemetryMonitorRenderer,
  ) {}

  connect(stream: ProductionFeedbackStream): TelemetryMonitorViewModel {
    this.consumer.connect(stream);
    return this.render();
  }

  disconnect(): TelemetryMonitorViewModel {
    this.consumer.disconnect();
    return this.render();
  }

  render(options: Readonly<TelemetryFilterOptions> = {}): TelemetryMonitorViewModel {
    const state = this.consumer.snapshot();
    const viewModel: TelemetryMonitorViewModel = Object.freeze({
      component: "TELEMETRY_MONITOR",
      connected: state.status === "CONNECTED",
      events: this.filter.apply(state.events, options),
    });
    this.renderer?.render(viewModel);
    return viewModel;
  }

  getState(): TelemetryMonitorState {
    return this.consumer.snapshot();
  }
}
