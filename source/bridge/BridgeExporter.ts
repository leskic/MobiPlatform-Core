import type { MobiOrigin } from "../origin/MobiOrigin";
import { BridgeTransaction } from "./BridgeTransaction";
import type { BridgePreparedProject } from "./interfaces/BridgeTypes";

export class BridgeExporter {
  constructor(private readonly origin: MobiOrigin) {}

  prepare(transactionId: string, sessionId: string): BridgePreparedProject {
    const project = this.origin.getProject();
    return {
      transaction: new BridgeTransaction(transactionId, sessionId, project.id, "export").get(),
      project
    };
  }
}
