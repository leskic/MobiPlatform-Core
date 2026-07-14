import type{AutoFixAuditEntry}from"./AutoFixTypes";export class AutoFixAuditLog{private entries:AutoFixAuditEntry[]=[];append(entry:AutoFixAuditEntry){this.entries.push(structuredClone(entry));return structuredClone(entry)}get(){return structuredClone(this.entries)}forProposal(id:string){return this.get().filter(e=>e.proposalId===id)}}

