# Cognitive Analyzer — Architect Handoff

The analyzer is isolated in `apps/mobi-cognitive-analyzer/`. Every pipeline implements the same read-only contract and may be executed independently.

The analyzer reads cloned Foundation project snapshots. It subscribes to public events and consumes RuleRunner results. It has no dependency on Origin, transaction execution internals, edit intents, or mutation callbacks.

