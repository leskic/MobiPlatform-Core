import type{IntegrityReport}from"./DiagnosticTypes";export class TraceabilityReporter{render(report:IntegrityReport){return report.diagnostics.map(d=>({diagnosticId:d.id,origin:d.origin,ruleId:d.ruleId,entityId:d.entityId,severity:d.severity,path:d.traceability.path,projectId:d.traceability.projectId,sequence:d.traceability.sequence,message:d.message}))}}

