# CP017-001 Homologation Guide

## Objective

Validate that Dinabox preflight gives a clear readiness status before adaptation.

## Scenarios

### Scenario 1 - Complete Project

Input: Dinabox project with modules, materials and `metadata.mobiConstructionDescriptor`.

Expected: `READY`.

### Scenario 2 - Missing Descriptor

Input: Dinabox project without `metadata.mobiConstructionDescriptor`.

Expected: `BLOCKED` with `MISSING_EXPLICIT_DESCRIPTOR`.

### Scenario 3 - Material Without Thickness

Input: Dinabox project with material name and id, but no thickness.

Expected: `READY_WITH_WARNINGS` with `MATERIAL_WITHOUT_THICKNESS`.

### Scenario 4 - Invalid Project Identity

Input: Dinabox project with empty id or name.

Expected: `BLOCKED` with `PREFLIGHT_ERROR`.

## Approval Criteria

- Build passes.
- Automated tests pass.
- Diagnostics are understandable by human review.
- No adaptation side effect happens during preflight.
- Coordination approves freeze after review and human test.
