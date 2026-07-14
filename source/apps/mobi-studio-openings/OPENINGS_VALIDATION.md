# Openings Validation

| Scenario | Required behavior | Verified |
|---|---|---|
| Opening without Wall | reject | yes |
| Opening outside bounds | reject | yes |
| Opening partially outside Wall | reject | yes |
| Opening overlap | reject | yes |
| Multiple non-overlapping Openings | accept | yes |
| Split Wall | rehost compatible segments | yes |
| Opening crossing Split | rollback | yes |
| Merge Wall | preserve geometry and new HostWallID | yes |
| Delete Wall | cascade delete in same transaction | yes |
| Move Wall | Opening follows geometry | yes |
| Resize Wall | accept if valid; otherwise rollback | yes |
| RuleRunner rejection | rollback | yes |
| Undo / redo | transactional restore | yes |
| Presentation | child node via public API | yes |

Validation operates with `1e-7` geometric tolerance. Horizontal and vertical intervals must both overlap for two Openings to conflict. Touching edges are allowed.

