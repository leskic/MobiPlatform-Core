# Auto-Fix Policy

Uma proposta somente é elegível quando permanece `PENDING`, referencia uma Golden Rule documentada com `autoFixable: true`, corresponde a uma regra ativa do `RuleRunner`, aponta para entidade existente e contém ação determinística segura.

Golden Rule inicial: `GOLDEN_ASSIGN_MISSING_MATERIAL`, diagnóstico `MATERIAL_MISSING_REFERENCE`, regra oficial `CABINETRY_MISSING_MATERIAL`, ação `ASSIGN_REFERENCE`, valor determinístico `MDF-15`.

São bloqueados Walls, Rooms, Openings, topologia, regras ausentes ou não documentadas, ações divergentes, entidades inexistentes, estado obsoleto, IA e heurísticas. Nenhuma execução acessa Origin ou Transaction Engine diretamente.
