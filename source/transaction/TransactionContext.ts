import type { MobiOrigin } from "../origin/MobiOrigin";
import type { TransactionContextInput, TransactionOperation } from "./interfaces/TransactionTypes";

export class TransactionContext {
  readonly author: string;
  readonly operationName: string;
  private readonly operation: TransactionOperation;
  constructor(input: TransactionContextInput) {
    if (input.author.trim().length === 0) throw new Error("Transaction author cannot be empty");
    if (input.operationName.trim().length === 0) throw new Error("Transaction operation name cannot be empty");
    this.author = input.author;
    this.operationName = input.operationName;
    this.operation = input.operation;
  }
  execute(origin: MobiOrigin): void { this.operation(origin); }
}
