# Checkpoint 50% — Products Layer Phase 3.2

Status: complete.

- Opening-aware Wall lifecycle implemented in the Phase 3.2 app.
- Split rehosts each Opening to its compatible segment and rejects a crossing Opening atomically.
- Merge preserves geometry and assigns the merged Wall host.
- Delete cascades hosted Openings in the same transaction.
- Wall movement carries Openings geometrically.
- Wall resize commits only when all hosted Openings remain valid.
- RuleRunner and environment-wide Opening validation gate every lifecycle commit.
- 15/15 focused tests passed; coverage hardening remains in progress.

