import { RulePackage } from "../../RulePackage";
import { EmptyProjectRule } from "./EmptyProjectRule";
import { ParentReferenceRule } from "./ParentReferenceRule";
import { ProjectIntegrityRule } from "./ProjectIntegrityRule";
import { UniqueIdRule } from "./UniqueIdRule";

export class CoreRulePackage extends RulePackage {
  constructor() {
    super({
      id: "mobi.core",
      displayName: "Mobi Core",
      description: "Fundamental structural integrity rules for Projeto.mobi.",
      category: { id: "core", displayName: "Core" },
      metadata: { version: "1.0.0", source: "Mobi Platform" },
      rules: [
        new ProjectIntegrityRule(),
        new UniqueIdRule(),
        new ParentReferenceRule(),
        new EmptyProjectRule()
      ]
    });
  }
}
