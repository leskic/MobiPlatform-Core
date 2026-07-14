import type { TransactionEngine } from "../../../../transaction/TransactionEngine";
import type { TransactionResultSnapshot } from "../../../../transaction/interfaces/TransactionTypes";
import type { EditIntent } from "../editor/EditIntent";
import type { TransactionRequestFactory } from "./TransactionRequestFactory";
import type { TransactionFeedback } from "./TransactionFeedback";
export class TransactionCoordinator { constructor(private readonly engine: TransactionEngine, private readonly factory: TransactionRequestFactory, private readonly feedback: TransactionFeedback) {} execute(intent: EditIntent): TransactionResultSnapshot { const request = this.factory.create(intent); const result = this.engine.execute(request, { author: intent.input.author, operationName: intent.input.operationName, operation: intent.input.operation }); this.feedback.update(result); return result; } }
