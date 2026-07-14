# Mobi Studio Walls — Architect Handoff

Implementação isolada em `apps/mobi-studio-walls/`. Foundation, Schema, RuleSets e aplicações congeladas não foram alterados. A representação usa exclusivamente `Architecture(type="wall")`; `referencePlane` funciona como endpoint determinístico do segmento na Products Layer. Preview não persiste estado. Commit e rollback percorrem o pipeline público do Studio.

Não foram implementados Openings, Technical Points, Appliances, PartCodes ou qualquer integração industrial.
