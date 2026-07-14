import type { Project } from "../../../builder/types/ProjectTypes";
import type { Rule } from "../../../copilot/rules/Rule";
import type { RuleContext } from "../../../copilot/rules/RuleContext";
import type { RuleResult } from "../../../copilot/rules/RuleResult";
import { TopologyValidator } from "./TopologyValidator";
export class TopologyRule implements Rule{readonly id="products.rooms.topology";readonly displayName="Room topology";readonly description="Validates formal room loops";readonly severity="error" as const;readonly enabled=true;analyze(context:RuleContext):RuleResult[]{const p=context.getProject() as Project,out:RuleResult[]=[];for(const [i,e] of p.environments.entries()){const marker=e.code.startsWith("ROOM:");if(!marker)continue;const result=new TopologyValidator().validate(e,e.architectures.filter(x=>x.type==="wall").map(x=>x.id));for(const issue of result.issues)out.push({severity:"error",code:`TOPOLOGY_${issue.code}`,message:issue.code,path:`/environments/${i}/architectures`})}return out}}
