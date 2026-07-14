# Architect Handoff — Auto-Fix

O app é uma extensão isolada da Cognitive Layer. Não houve alteração em Constituição, Modelo Semântico, Transação Mobi, ADR-001, Foundation, Products Layer ou RuleRunner.

Fluxo: Proposition `PENDING` → Policy Engine → Golden Rule → `EditIntent` → `TransactionCoordinator` → commit/rollback. O histórico do coordenador suporta undo/redo transacional. O audit log registra `AUTOMATED_CORRECTION` e todos os metadados obrigatórios. Não há acesso direto a Origin ou Transaction Engine.
