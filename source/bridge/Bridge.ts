import type { Project } from "../builder/types/ProjectTypes";
import type { MobiOrigin } from "../origin/MobiOrigin";
import { BridgeEvent } from "./BridgeEvent";
import { BridgeExporter } from "./BridgeExporter";
import { BridgeImporter } from "./BridgeImporter";
import { BridgeSession } from "./BridgeSession";
import { BridgeState } from "./BridgeState";
import type {
  BridgePreparedProject,
  BridgeSessionSnapshot,
  BridgeStateSnapshot
} from "./interfaces/BridgeTypes";

export class Bridge {
  private readonly session = new BridgeSession();
  private readonly exporter: BridgeExporter;
  private readonly importer: BridgeImporter;
  private readonly state: BridgeState;

  constructor(private readonly origin: MobiOrigin) {
    this.exporter = new BridgeExporter(origin);
    this.importer = new BridgeImporter(origin);
    this.state = new BridgeState(origin, this.session);
  }

  createSession(id: string): BridgeSessionSnapshot {
    return this.session.create(id);
  }

  openSession(): BridgeSessionSnapshot {
    return this.session.openSession();
  }

  closeSession(): BridgeSessionSnapshot {
    return this.session.close();
  }

  readProject(): Project {
    this.session.requireOpenId();
    return this.origin.getProject();
  }

  prepareExport(transactionId: string): BridgePreparedProject {
    return this.prepare(transactionId, "export");
  }

  prepareImport(transactionId: string): BridgePreparedProject {
    return this.prepare(transactionId, "import");
  }

  getState(): BridgeStateSnapshot {
    return this.state.get();
  }

  private prepare(transactionId: string, direction: "export" | "import"): BridgePreparedProject {
    const sessionId = this.session.requireOpenId();
    const prepared = direction === "export"
      ? this.exporter.prepare(transactionId, sessionId)
      : this.importer.prepare(transactionId, sessionId);
    this.session.record(new BridgeEvent("transaction-prepared", sessionId, transactionId));
    return structuredClone(prepared);
  }
}
