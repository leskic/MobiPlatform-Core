import type {
  ConnectedIndustrialContracts,
  IndustrialConnectionState,
} from "./IndustrialConnectionState";
import type { IndustrialContractSnapshot } from "./IndustrialContracts";

export class IndustrialLifecycle {
  private contracts: IndustrialContractSnapshot | undefined;
  private sequence = 0;

  connect(snapshot: IndustrialContractSnapshot): IndustrialConnectionState {
    if (this.contracts) throw new Error("INDUSTRIAL_ALREADY_CONNECTED");
    this.contracts = snapshot;
    this.sequence += 1;
    return this.getState();
  }

  disconnect(): IndustrialConnectionState {
    if (!this.contracts) throw new Error("INDUSTRIAL_NOT_CONNECTED");
    this.contracts = undefined;
    this.sequence += 1;
    return this.getState();
  }

  getState(): IndustrialConnectionState {
    const manifest = this.contracts?.manifest;
    return Object.freeze({
      status: manifest ? "CONNECTED" : "DISCONNECTED",
      connected: Boolean(manifest),
      projectId: manifest?.projectId ?? null,
      micVersion: manifest?.version ?? null,
      lifecycleSequence: this.sequence,
    });
  }

  getContracts(): ConnectedIndustrialContracts {
    if (!this.contracts) throw new Error("INDUSTRIAL_NOT_CONNECTED");
    return this.contracts;
  }
}
