# Verification Engine Specification

O motor compara width, height, thickness e status realizado com o pacote fabricável. Desvios geram auditoria determinística e bloqueio; feedback forjado/inconsistente é rejeitado. Cada verificação publica `INDUSTRIAL_VERIFICATION` pelo contrato de Cognitive Events e registra somente `INDUSTRIAL_TRACEABILITY_EVENT` via TransactionCoordinator.
