# Traceability Matrix — Phase 4.2

| Proposal field | Source |
|---|---|
| ProposalID | Diagnostic ID + deterministic template index |
| OriginDiagnosisID | `Diagnostic.id` |
| RuleID | `Diagnostic.ruleId` |
| EntityID | `Diagnostic.entityId` |
| ExpectedImpact | deterministic catalog template |
| TransactionRequestID | Diagnostic ID + deterministic template index |
| Diagnostic origin/path | Diagnostic traceability |
| ProjectID | Diagnostic traceability |
| Diagnostic sequence | Diagnostic traceability |
| Proposal sequence | engine invocation |

Tests verify deterministic identity, multiple allowed proposals, RuleRunner conformity, entity existence, semantic consistency, preview restoration, immutable PENDING parameters, and absence of commit authority.

