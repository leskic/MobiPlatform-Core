# Transaction Bridge Specification

Fluxo: StudioIntent → leitura do RuleRunner → EditIntent → TransactionCoordinator → TransactionRequest oficial. O callback de operação é resolvido por integração autorizada e só é executado dentro da transação. Falha ou bloqueio descarta/retrocede Preview. A cena permanente sincroniza exclusivamente por TransactionEvents após commit.

Undo/Redo não possuem contrato público no TransactionCoordinator atual; consulte `docs/RFE_TRANSACTION_COORDINATOR_UNDO_REDO.md`.
