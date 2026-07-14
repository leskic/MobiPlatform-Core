import type { IndustrialContractSnapshot } from "../../../mobi-products/mobi-constructor/src/index";
import type { IndustrialValidationResult, IndustrialValidationSummary } from "./IndustrialValidationResult";
import { FlowDiagnostics } from "./FlowDiagnostics";
import { ProductionConsistencyValidator } from "./ProductionConsistencyValidator";
import { SnapshotValidator } from "./SnapshotValidator";

export class IndustrialValidationRunner {
  constructor(
    private readonly snapshotValidator = new SnapshotValidator(),
    private readonly consistencyValidator = new ProductionConsistencyValidator(),
  ) {}

  validate(snapshot: IndustrialContractSnapshot | null | undefined): IndustrialValidationResult {
    const diagnostics = new FlowDiagnostics();
    diagnostics.merge(this.snapshotValidator.validate(snapshot));
    diagnostics.merge(this.consistencyValidator.validate(snapshot));
    const certified = diagnostics.valid;
    return Object.freeze({
      certified,
      status: certified ? "CERTIFIED" : "REJECTED",
      diagnostics: diagnostics.snapshot(),
      summary: this.summary(snapshot, certified),
    });
  }

  private summary(snapshot: IndustrialContractSnapshot | null | undefined, certified: boolean): IndustrialValidationSummary {
    return Object.freeze({
      projectId: snapshot?.manifest.projectId ?? null,
      certified,
      manifestParts: snapshot?.manifest.parts.length ?? 0,
      bomLines: snapshot?.bom.lines.length ?? 0,
      camPaths: snapshot?.cam.paths.length ?? 0,
      camOperations: snapshot?.cam.operations.length ?? 0,
      feedbackEvents: snapshot?.feedback.snapshot().length ?? 0,
    });
  }
}
