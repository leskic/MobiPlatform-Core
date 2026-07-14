# Industrial Pipeline

Fluxo determinístico: ProjectReader → PartGenerator → RuleRunner → BOMManager → CAMBridge → Industrial Output. Antes da geração, o Cognitive Analyzer deve retornar `HEALTHY` sem erros. Ao final, somente o evento transacional `INDUSTRIAL_EXPORT` é registrado pelo TransactionCoordinator, com operação que não modifica Projeto.mobi.

Qualquer bloqueio cognitivo, inconsistência de BOM, divergência de projeto no CAM ou rollback transacional interrompe integralmente a exportação.
