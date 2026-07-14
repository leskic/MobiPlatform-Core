import type {
  ProductionDashboardField,
  ProductionDashboardState,
} from "./ProductionDashboardState";
import type { ProductionDashboardViewModel } from "./ProductionDashboardViewModel";

export class ProductionDashboardFormatter {
  constructor(private readonly unavailableLabel = "Indisponível") {}

  format(state: Readonly<ProductionDashboardState>): ProductionDashboardViewModel {
    return Object.freeze({
      component: "PRODUCTION_DASHBOARD",
      hasData: state.status === "READY",
      fields: Object.freeze({
        projectName: this.field(state.projectName),
        productionStatus: this.field(state.productionStatus),
        progress: this.field(state.progress),
        totalParts: this.field(state.totalParts),
        producedParts: this.field(state.producedParts),
        pendingParts: this.field(state.pendingParts),
        failedParts: this.field(state.failedParts),
        updatedAt: this.field(state.updatedAt),
        manifestVersion: this.field(state.manifestVersion),
        micVersion: this.field(state.micVersion),
        productionId: this.field(state.productionId),
      }),
    });
  }

  private field(field: ProductionDashboardField<string | number>): string {
    return field.available && field.value !== null
      ? String(field.value)
      : this.unavailableLabel;
  }
}
