import type { MobiOrigin } from "../origin/MobiOrigin";
import type { TransactionRequestSnapshot } from "../orchestrator/interfaces/OrchestratorTypes";
import { Transaction } from "./Transaction";
import { TransactionContext } from "./TransactionContext";
import { TransactionExecutor } from "./TransactionExecutor";
import { TransactionLog } from "./TransactionLog";
import { TransactionResult } from "./TransactionResult";
import { TransactionRollback } from "./TransactionRollback";
import { TransactionValidator } from "./TransactionValidator";
import type { TransactionContextInput, TransactionResultSnapshot } from "./interfaces/TransactionTypes";

export class TransactionEngine {
  private readonly validator = new TransactionValidator();
  private readonly executor = new TransactionExecutor();
  private readonly rollback = new TransactionRollback();
  private readonly logs = new TransactionLog();
  constructor(private readonly origin: MobiOrigin) {}

  execute(request: TransactionRequestSnapshot, input: TransactionContextInput): TransactionResultSnapshot {
    const transaction = new Transaction(structuredClone(request));
    const context = new TransactionContext(input);
    const snapshot = this.rollback.capture(this.origin);
    try {
      transaction.transition("VALIDATE");
      this.validator.validate(request);
      if (!this.origin.validateProject().valid) throw new Error("Origin project is invalid before transaction");
      transaction.transition("EXECUTE");
      this.executor.execute(context, this.origin);
      if (!this.origin.validateProject().valid) throw new Error("Origin project is invalid after transaction");
      transaction.transition("COMMIT");
      transaction.transition("FINISH");
      const log = this.logs.create(transaction, context, "COMMITTED", false);
      return new TransactionResult(request, "COMMITTED", log).get();
    } catch (error: unknown) {
      transaction.transition("ROLLBACK");
      this.rollback.restore(this.origin, snapshot);
      transaction.transition("FINISH");
      const log = this.logs.create(transaction, context, "ROLLED_BACK", true);
      const message = error instanceof Error ? error.message : "Unknown transaction error";
      return new TransactionResult(request, "ROLLED_BACK", log, message).get();
    }
  }
}
