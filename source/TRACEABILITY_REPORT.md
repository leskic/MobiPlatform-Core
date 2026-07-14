# Traceability Report — Phase 4.1

Every diagnostic contains:

- stable diagnostic identifier;
- pipeline origin;
- explicit `ruleId`;
- severity;
- affected entity identifier;
- message;
- project identifier;
- entity path;
- analyzer sequence.

The `TraceabilityReporter` exports these fields without transformation or loss. Tests verify rule identity, entity identity, path, sequence, deterministic repeatability, immutable report history, and absence of project mutation.

