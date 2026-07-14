import { ResolutionDecision } from "./ResolutionDecision";
import type { ResolutionContext } from "./ResolutionContext";
import { RESOLUTION_STRATEGIES, type ResolutionStrategy } from "./ResolutionStrategy";

export class ConflictResolver {
  select(context: ResolutionContext, strategy: ResolutionStrategy): ResolutionDecision {
    if (!RESOLUTION_STRATEGIES.includes(strategy)) throw new Error(`Unsupported resolution strategy: ${strategy}`);
    const report = context.get().report;
    return new ResolutionDecision(strategy, report.entity, report.transactionId);
  }
}
