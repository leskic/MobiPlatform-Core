# Mobi Studio Openings

Products Layer Phase 3.2. An Opening reuses the official `Architecture(type="opening")` entity and is always attached to an `Architecture(type="wall")` through mandatory `hostId`.

Geometry is architectural and host-relative: `offset` is measured along the Wall, `sillHeight` vertically from the Wall base, and `width`/`height` define the opening rectangle. No door, window, model, frame, leaf, hardware, PartCode, or industrial output exists in this phase.

All mutations use `MobiStudioApplication.beginEdit()` / `commitEdit()` and therefore the official transaction pipeline. `OpeningAwareWallsController` provides the Phase 3.2-safe Wall lifecycle for split, merge, delete, move, and resize.

