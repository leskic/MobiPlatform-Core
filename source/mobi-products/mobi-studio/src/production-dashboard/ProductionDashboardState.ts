export interface ProductionDashboardField<T> {
  readonly available: boolean;
  readonly value: T | null;
}

export interface ProductionDashboardState {
  readonly status: "NO_DATA" | "READY";
  readonly snapshotSequence: number;
  readonly projectName: ProductionDashboardField<string>;
  readonly productionStatus: ProductionDashboardField<string>;
  readonly progress: ProductionDashboardField<number>;
  readonly totalParts: ProductionDashboardField<number>;
  readonly producedParts: ProductionDashboardField<number>;
  readonly pendingParts: ProductionDashboardField<number>;
  readonly failedParts: ProductionDashboardField<number>;
  readonly updatedAt: ProductionDashboardField<string>;
  readonly manifestVersion: ProductionDashboardField<string>;
  readonly micVersion: ProductionDashboardField<string>;
  readonly productionId: ProductionDashboardField<string>;
}

export const unavailableField = <T>(): ProductionDashboardField<T> =>
  Object.freeze({ available: false, value: null });

export const availableField = <T>(value: T): ProductionDashboardField<T> =>
  Object.freeze({ available: true, value });
