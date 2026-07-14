import type { BOMViewerViewModel } from "../bom-viewer/BOMViewerViewModel";
import type { CAMVisualizerViewModel } from "../cam-visualizer/CAMVisualizerViewModel";
import type { IndustrialConnectionState } from "../industrial-integration/IndustrialConnectionState";
import type { ProductionDashboardViewModel } from "../production-dashboard/ProductionDashboardViewModel";
import type { TelemetryMonitorViewModel } from "../telemetry-monitor/TelemetryMonitorViewModel";

export interface ProductionIntegrationViewModel {
  readonly component: "PRODUCTION_INTEGRATION";
  readonly connection: IndustrialConnectionState;
  readonly dashboard: ProductionDashboardViewModel;
  readonly bom: BOMViewerViewModel;
  readonly cam: CAMVisualizerViewModel;
  readonly telemetry: TelemetryMonitorViewModel;
}

export interface ProductionIntegrationRenderer {
  render(viewModel: ProductionIntegrationViewModel): void;
}
