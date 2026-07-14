import { BOMViewerController, type BOMViewerOptions } from "../bom-viewer/BOMViewerController";
import { CAMVisualizerController } from "../cam-visualizer/CAMVisualizerController";
import type { IndustrialContractSnapshot } from "../industrial-integration/IndustrialContracts";
import { IndustrialIntegrationCoordinator } from "../industrial-integration/IndustrialIntegrationCoordinator";
import { ProductionDashboardController } from "../production-dashboard/ProductionDashboardController";
import { TelemetryMonitorController } from "../telemetry-monitor/TelemetryMonitorController";
import type { TelemetryFilterOptions } from "../telemetry-monitor/TelemetryFilter";
import type {
  ProductionIntegrationRenderer,
  ProductionIntegrationViewModel,
} from "./ProductionIntegrationViewModel";

export interface ProductionIntegrationViewOptions {
  readonly bom?: Readonly<BOMViewerOptions>;
  readonly telemetry?: Readonly<TelemetryFilterOptions>;
}

export class ProductionIntegrationController {
  constructor(
    private readonly integration = new IndustrialIntegrationCoordinator(),
    private readonly dashboard = new ProductionDashboardController(),
    private readonly bom = new BOMViewerController(),
    private readonly cam = new CAMVisualizerController(),
    private readonly telemetry = new TelemetryMonitorController(),
    private readonly renderer?: ProductionIntegrationRenderer,
  ) {}

  connect(snapshot: IndustrialContractSnapshot): ProductionIntegrationViewModel {
    this.integration.connect(snapshot);
    try {
      this.dashboard.connect(snapshot.manifest);
      this.bom.connect(snapshot.bom);
      this.cam.connect(snapshot.cam);
      this.telemetry.connect(snapshot.feedback);
      return this.render();
    } catch (error) {
      this.rollbackConnection();
      throw error;
    }
  }

  disconnect(): ProductionIntegrationViewModel {
    this.telemetry.disconnect();
    this.dashboard.disconnect();
    this.bom.disconnect();
    this.cam.disconnect();
    this.integration.disconnect();
    return this.render();
  }

  render(options: Readonly<ProductionIntegrationViewOptions> = {}): ProductionIntegrationViewModel {
    const viewModel: ProductionIntegrationViewModel = Object.freeze({
      component: "PRODUCTION_INTEGRATION",
      connection: this.integration.getState(),
      dashboard: this.dashboard.render(),
      bom: this.bom.view(options.bom),
      cam: this.cam.render(),
      telemetry: this.telemetry.render(options.telemetry),
    });
    this.renderer?.render(viewModel);
    return viewModel;
  }

  private rollbackConnection(): void {
    if (this.telemetry.getState().status === "CONNECTED") this.telemetry.disconnect();
    if (this.integration.getState().connected) this.integration.disconnect();
    this.dashboard.disconnect();
    this.bom.disconnect();
    this.cam.disconnect();
  }
}
