# Collision Engine — Phase 3.3

The engine operates on axis-aligned reference volumes only. It creates no solid geometry or mesh.

| Scenario | Result |
|---|---|
| Appliance × Wall | collision and invasion reported |
| Appliance × Appliance | collision and overlap reported |
| Appliance × Opening | blocking reported |
| Clearance insufficient | rejected |
| Outside environment | rejected |
| Partially external | rejected |
| Invalid Collision/Clearance volume | rejected |
| Missing optional host reference | rejected when supplied |

Appliances/Collision focused suite: 27/27. Coverage: 100% statements, 95.32% branches, 100% functions, 100% lines.

