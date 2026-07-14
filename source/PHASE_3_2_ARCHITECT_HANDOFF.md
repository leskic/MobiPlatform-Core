# Phase 3.2 — Architect Handoff

Phase 3.2 is complete and stopped for audit.

The architectural dependency is explicit: an Opening belongs to an Environment and must reference a Wall through `hostId`. Opening-aware Wall mutations are exposed by `OpeningAwareWallsController` so Wall and dependent Openings change in one transaction.

The Presentation adapter creates only scene nodes through public APIs. It introduces no 3D model or specialized opening type. Industrial layers do not consume Openings.

Technical Points and Appliances were not started.

