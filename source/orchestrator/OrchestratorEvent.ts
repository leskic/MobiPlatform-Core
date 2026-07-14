import type { OrchestratorEventSnapshot, OrchestratorEventType } from "./interfaces/OrchestratorTypes";

export class OrchestratorEvent {
  constructor(
    private readonly type: OrchestratorEventType,
    private readonly transactionId: string,
    private readonly entity: string,
    private readonly logicalTimestamp: number
  ) {}
  get(): OrchestratorEventSnapshot {
    return { type: this.type, transactionId: this.transactionId, entity: this.entity, logicalTimestamp: this.logicalTimestamp };
  }
}
