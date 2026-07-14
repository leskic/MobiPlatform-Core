# CP015 Fix 001 Report

## Origin

Human homologation CP015.

## Bug

The `Novo Projeto` action preserved the previously loaded Projeto.mobi state, including Wall Editor, Door Editor, Technical Documentation, Parts Hierarchy, and Parts Inspector data.

## Root Cause

`App.startNewProject()` reused the current application state and explicitly kept the loaded project artifacts instead of replacing them with a clean creation state.

## Fix

- Reset the loaded project to `null`.
- Reset Wall Editor to an empty state.
- Reset Door Editor to an empty state.
- Reset Wall and Door command histories.
- Clear execution, Technical Documentation, Parts Hierarchy, and Parts Inspector state.
- Keep the app in `creating-project` status.

## Scope Guard

No Parts, Hierarchy, Inspector, Constructor, MobiView, FlowRunner, architecture, or public contracts were changed.

## Validation

- Host build: passed.
- Host tests: passed.
- Full build: passed.
- Full regression: passed.
