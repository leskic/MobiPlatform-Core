# Mobi Studio Openings — Architect Handoff

The Phase 3.2 implementation is isolated under `apps/mobi-studio-openings/`. Foundation, Schema, RuleSets, Walls, Rooms, and industrial applications were not modified.

`OpeningsController` owns Opening mutations and history. `OpeningAwareWallsController` is the required integration boundary for Wall lifecycle operations while Openings exist; using the frozen raw Walls controller cannot provide atomic Opening reconciliation.

Every commit is gated by environment-wide Opening validation and the injected RuleRunner. A rejected Opening or Wall lifecycle operation rolls back atomically.

No Technical Points or Appliances were started.

