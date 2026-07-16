# CP017-001 Release Notes

## Added

- Dinabox preflight readiness report.
- CP017-001 checkpoint identifier in preflight output.
- Readiness status: `READY`, `READY_WITH_WARNINGS`, `BLOCKED`.
- Summary counts and deterministic diagnostic items.

## Changed

- Public adapter entry point now exports `DinaboxPreflight`.
- Dinabox adapter tests now include CP017-001 preflight coverage.

## Not Changed

- Adapter adaptation flow.
- Constructor integration.
- Transaction behavior.
- Foundation, schema, Products Layer, MIC, CAM, BOM and production logic.
