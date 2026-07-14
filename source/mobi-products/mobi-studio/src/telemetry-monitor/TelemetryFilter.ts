import type { ProductionFeedbackEvent } from "../industrial-integration/IndustrialContracts";

export interface TelemetryFilterOptions {
  readonly partIds?: readonly string[];
  readonly statuses?: readonly ProductionFeedbackEvent["status"][];
  readonly metric?: string;
  readonly telemetryOnly?: boolean;
}

export class TelemetryFilter {
  apply(
    events: readonly ProductionFeedbackEvent[],
    options: Readonly<TelemetryFilterOptions> = {},
  ): readonly ProductionFeedbackEvent[] {
    const metric = options.metric?.trim().toLocaleLowerCase();
    return structuredClone(events.filter((event) => {
      if (options.partIds?.length && !options.partIds.includes(event.partId)) return false;
      if (options.statuses?.length && !options.statuses.includes(event.status)) return false;
      if (options.telemetryOnly && !event.telemetry) return false;
      if (metric && !event.telemetry?.metric.toLocaleLowerCase().includes(metric)) return false;
      return true;
    }));
  }
}
