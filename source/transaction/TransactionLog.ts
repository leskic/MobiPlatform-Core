import type { Transaction } from "./Transaction";
import type { TransactionContext } from "./TransactionContext";
import type { TransactionLogSnapshot, TransactionStatus } from "./interfaces/TransactionTypes";

export class TransactionLog {
  create(transaction: Transaction, context: TransactionContext, result: TransactionStatus, rollbackExecuted: boolean): TransactionLogSnapshot {
    return {
      transactionId: transaction.request.id,
      logicalTimestamp: transaction.request.logicalTimestamp,
      source: transaction.request.source,
      author: context.author,
      state: transaction.getState(),
      operations: [context.operationName],
      result,
      rollbackExecuted,
      events: transaction.getEvents()
    };
  }
}
