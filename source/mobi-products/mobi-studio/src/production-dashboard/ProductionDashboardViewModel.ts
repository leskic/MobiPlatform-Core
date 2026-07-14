export interface ProductionDashboardViewModel {
  readonly component: "PRODUCTION_DASHBOARD";
  readonly hasData: boolean;
  readonly fields: Readonly<{
    projectName: string;
    productionStatus: string;
    progress: string;
    totalParts: string;
    producedParts: string;
    pendingParts: string;
    failedParts: string;
    updatedAt: string;
    manifestVersion: string;
    micVersion: string;
    productionId: string;
  }>;
}

export interface ProductionDashboardRenderer {
  render(viewModel: ProductionDashboardViewModel): void;
}
