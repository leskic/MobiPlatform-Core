# Auto-Fix Audit Log

Cada tentativa gera entrada imutável `AUTOMATED_CORRECTION` com ProposalID, EntityID, estado, mensagem e, quando disponível, TransactionID. Correções registram `SourceRuleID`, `OriginDiagnosisID`, `AutoFixTimestamp`, `AutomatedSignature` determinística e `TransactionRequestID`.

Estados auditáveis: `COMMITTED`, `ROLLED_BACK`, `UNDONE` e `REDONE`. A atomicidade e restauração são garantidas por transações oficiais; somente commit e redo bem-sucedidos emitem “Ação corretiva automática aplicada.”
