import type { TransactionRequestSnapshot } from "../orchestrator/interfaces/OrchestratorTypes";

export class TransactionValidator {
  validate(request: TransactionRequestSnapshot): void {
    if (request.status !== "PREPARED") throw new Error("Transaction request must be PREPARED");
    if (request.id.trim().length === 0) throw new Error("Transaction id cannot be empty");
    if (!Number.isSafeInteger(request.logicalTimestamp) || request.logicalTimestamp < 0) {
      throw new Error("Transaction logical timestamp must be a non-negative safe integer");
    }
  }
}
