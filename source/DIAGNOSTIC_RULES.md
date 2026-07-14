# Diagnostic Rules — Phase 4.1

| Pipeline | Deterministic rule source |
|---|---|
| Architecture | `ARCH_ENVIRONMENT_WITHOUT_ARCHITECTURE` |
| Products | `PRODUCT_DUPLICATE_MODULE_CODE` |
| Materials | `MATERIAL_MISSING_REFERENCE` |
| Hardware | `HARDWARE_MISSING_CATALOG` |
| Topology | official `TopologyValidator` issue codes |
| Openings | official `OpeningValidator` issue codes |
| Technical Points | official `TechnicalPointValidator` issue codes |
| Appliances | official `CollisionEngine` issue codes |
| Production | public RuleRunner result code |

Rules only inspect explicit state. No probability, AI, heuristic ranking, inferred correction, or mutation is used. Draft topology is not diagnosed as a Room, preventing the documented false-positive class.

