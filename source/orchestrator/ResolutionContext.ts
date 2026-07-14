import type { DivergenceReportSnapshot, SyncEventSnapshot } from "../sync/interfaces/SyncTypes";
import type { ResolutionContextSnapshot } from "./interfaces/OrchestratorTypes";

export class ResolutionContext {
  constructor(
    private readonly report: DivergenceReportSnapshot,
    private readonly syncEvent: SyncEventSnapshot | null
  ) {}
  get(): ResolutionContextSnapshot {
    return structuredClone({ report: this.report, syncEvent: this.syncEvent });
  }
}
