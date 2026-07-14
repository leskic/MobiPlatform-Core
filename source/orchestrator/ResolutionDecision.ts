import type { ResolutionDecisionSnapshot } from "./interfaces/OrchestratorTypes";
import type { ResolutionStrategy } from "./ResolutionStrategy";

export class ResolutionDecision {
  constructor(
    private readonly strategy: ResolutionStrategy,
    private readonly entity: string,
    private readonly transactionId: string
  ) {}
  get(): ResolutionDecisionSnapshot {
    return { strategy: this.strategy, entity: this.entity, transactionId: this.transactionId, requiresExecution: false };
  }
}
