import type { MobiOrigin } from "../origin/MobiOrigin";
import type { TransactionContext } from "./TransactionContext";

export class TransactionExecutor {
  execute(context: TransactionContext, origin: MobiOrigin): void { context.execute(origin); }
}
