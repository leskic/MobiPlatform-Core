import { RulePackage } from "../../RulePackage";
import { DuplicatePartCodeRule } from "./DuplicatePartCodeRule";
import { InvalidGrainDirectionRule } from "./InvalidGrainDirectionRule";
import { InvalidPartDimensionsRule } from "./InvalidPartDimensionsRule";
import { MissingEdgeBandRule } from "./MissingEdgeBandRule";
import { MissingPartCodeRule } from "./MissingPartCodeRule";

export class ProductionRulePackage extends RulePackage {
  constructor() {
    super({
      id: "mobi.production",
      displayName: "Mobi Production",
      description: "Preparatory production registration consistency rules.",
      category: { id: "production", displayName: "Production" },
      metadata: { version: "1.0.0", source: "Mobi Platform" },
      rules: [
        new MissingPartCodeRule(),
        new DuplicatePartCodeRule(),
        new InvalidPartDimensionsRule(),
        new InvalidGrainDirectionRule(),
        new MissingEdgeBandRule()
      ]
    });
  }
}
