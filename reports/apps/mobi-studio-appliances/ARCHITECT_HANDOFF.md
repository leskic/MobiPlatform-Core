# Appliances — Architect Handoff

Appliances remain architectural reference data. `appliance:` identifies CollisionVolume and `appliance-clearance:` identifies the paired ClearanceVolume. The pairing uses the clearance record's `hostId` to reference its Appliance.

`EnvironmentalCascadeController` is the Phase 3.3 boundary for deleting hosted surfaces atomically. `EnvironmentalPresentation` creates derived scene nodes through public APIs only.

No PartCode, part, material, Manufacturing, CAM, G-Code, or industrial detailing integration exists.

