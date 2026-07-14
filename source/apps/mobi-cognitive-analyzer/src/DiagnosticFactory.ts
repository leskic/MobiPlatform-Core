import type{Diagnostic,DiagnosticSeverity}from"./DiagnosticTypes";export function diagnostic(pipeline:string,ruleId:string,severity:DiagnosticSeverity,entityId:string,message:string,path:string,projectId:string,sequence:number):Diagnostic{return{id:`${pipeline}:${ruleId}:${entityId}`,origin:pipeline,ruleId,severity,entityId,message,traceability:{pipeline,ruleId,path,projectId,sequence}}}

