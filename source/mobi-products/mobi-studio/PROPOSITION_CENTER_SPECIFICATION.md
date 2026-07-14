# Proposition Center Specification

A fila aceita somente Proposition e TransactionRequest em estado PENDING. Cards mostram ExpectedImpact, RuleID, EntityID e ações Aceitar/Ignorar. Aceitar executa Preview → TransactionCoordinator → descarte; sucesso remove a proposta e a UI aguarda TransactionEvent. Falha mantém a fila. Ignorar remove apenas a cópia local. A proposta original nunca é modificada.
