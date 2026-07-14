# Proposition Specification — Phase 4.2

## Required proposal fields

- `proposalId`
- `originDiagnosisId`
- `ruleId`
- `entityId`
- `expectedImpact`
- `transactionRequestId`
- `status: PENDING`
- diagnostic and proposal traceability coordinates

## Pending request contract

The request contains identity, target entity, review-only action, source, destination, logical timestamp, immutable parameters, and mandatory `PENDING` status. It contains no operation callback and cannot execute.

Allowed actions are review-only: entity, connectivity, topology, host, placement, reference assignment, and duplicate resolution review. Multiple propositions are allowed only for deterministic duplicate and topology catalog mappings.

Invalid constitutional action, unknown rule, trace mismatch, invalid topology routing, missing entity, inconsistent request routing, or non-PENDING state blocks the proposal.

