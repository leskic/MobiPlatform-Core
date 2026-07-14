import {
  ProductionDashboardConsumer,
  type ProductionManifestInput,
} from "./ProductionDashboardConsumer";
import { ProductionDashboardFormatter } from "./ProductionDashboardFormatter";
import type { ProductionDashboardState } from "./ProductionDashboardState";
import type {
  ProductionDashboardRenderer,
  ProductionDashboardViewModel,
} from "./ProductionDashboardViewModel";

export class ProductionDashboardController {
  constructor(
    private readonly consumer = new ProductionDashboardConsumer(),
    private readonly formatter = new ProductionDashboardFormatter(),
    private readonly renderer?: ProductionDashboardRenderer,
  ) {}

  connect(manifest: ProductionManifestInput | null | undefined): ProductionDashboardViewModel {
    return this.present(this.consumer.consume(manifest));
  }

  update(manifest: ProductionManifestInput | null | undefined): ProductionDashboardViewModel {
    return this.present(this.consumer.consume(manifest));
  }

  disconnect(): ProductionDashboardViewModel {
    return this.present(this.consumer.disconnect());
  }

  render(): ProductionDashboardViewModel {
    return this.present(this.consumer.snapshot());
  }

  getState(): ProductionDashboardState {
    return this.consumer.snapshot();
  }

  private present(state: ProductionDashboardState): ProductionDashboardViewModel {
    const viewModel = this.formatter.format(state);
    this.renderer?.render(viewModel);
    return viewModel;
  }
}
