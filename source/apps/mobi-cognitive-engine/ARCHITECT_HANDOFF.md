# Proposition Engine — Architect Handoff

The engine is isolated under `apps/mobi-cognitive-engine/`. Its request contract is intentionally distinct from the frozen executable orchestrator request: cognitive requests remain `PENDING` and contain data only.

The public API exposes proposition generation, validation, preview, cancel, and UI projection. It exposes no execute, accept, commit, mutation callback, or Origin dependency.

Phase 4.3 Auto-Fix was not started.

