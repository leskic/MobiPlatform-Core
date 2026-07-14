import type{PropositionBatch}from"./PropositionTypes";export class PropositionUiAdapter{present(batches:readonly PropositionBatch[]){return batches.flatMap(b=>b.propositions.map(p=>({proposalId:p.proposalId,diagnosisId:p.originDiagnosisId,ruleId:p.ruleId,entityId:p.entityId,impact:p.expectedImpact,status:p.status,transactionRequestId:p.transactionRequestId,selectable:true,committable:false})))}}

