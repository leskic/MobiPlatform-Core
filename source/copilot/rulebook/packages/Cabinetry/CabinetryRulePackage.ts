import { RulePackage } from "../../RulePackage";
import { DuplicateEnvironmentCodeRule } from "./DuplicateEnvironmentCodeRule";
import { DuplicateHardwareRule } from "./DuplicateHardwareRule";
import { DuplicateModuleCodeRule } from "./DuplicateModuleCodeRule";
import { EmptyModuleRule } from "./EmptyModuleRule";
import { MissingMaterialRule } from "./MissingMaterialRule";

export class CabinetryRulePackage extends RulePackage {
  constructor() {
    super({
      id: "mobi.cabinetry",
      displayName: "Mobi Cabinetry",
      description: "Fundamental cabinetry registration consistency rules.",
      category: { id: "cabinetry", displayName: "Cabinetry" },
      metadata: { version: "1.0.0", source: "Mobi Platform" },
      rules: [
        new DuplicateModuleCodeRule(),
        new DuplicateEnvironmentCodeRule(),
        new EmptyModuleRule(),
        new MissingMaterialRule(),
        new DuplicateHardwareRule()
      ]
    });
  }
}
