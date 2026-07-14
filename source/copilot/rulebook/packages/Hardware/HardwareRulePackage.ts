import { RulePackage } from "../../RulePackage";
import { DuplicateCatalogHardwareRule } from "./DuplicateCatalogHardwareRule";
import { InvalidHardwareCatalogRule } from "./InvalidHardwareCatalogRule";
import { InvalidHardwareHostRule } from "./InvalidHardwareHostRule";
import { MissingHardwarePositionRule } from "./MissingHardwarePositionRule";
import { OrphanHardwareRule } from "./OrphanHardwareRule";

export class HardwareRulePackage extends RulePackage {
  constructor() {
    super({
      id: "mobi.hardware",
      displayName: "Mobi Hardware",
      description: "Hardware registration and relationship integrity rules.",
      category: { id: "hardware", displayName: "Hardware" },
      metadata: { version: "1.0.0", source: "Mobi Platform" },
      rules: [
        new InvalidHardwareHostRule(),
        new InvalidHardwareCatalogRule(),
        new DuplicateCatalogHardwareRule(),
        new MissingHardwarePositionRule(),
        new OrphanHardwareRule()
      ]
    });
  }
}
