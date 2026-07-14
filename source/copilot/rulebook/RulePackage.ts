import type { Rule } from "../rules/Rule";
import type { RuleCategory } from "./RuleCategory";
import type { RuleMetadata } from "./RuleMetadata";

export class RulePackage {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: RuleCategory;
  readonly metadata: RuleMetadata;
  readonly rules: readonly Rule[];

  constructor(input: {
    id: string;
    displayName: string;
    description: string;
    category: RuleCategory;
    metadata: RuleMetadata;
    rules: readonly Rule[];
  }) {
    this.id = input.id;
    this.displayName = input.displayName;
    this.description = input.description;
    this.category = structuredClone(input.category);
    this.metadata = structuredClone(input.metadata);
    this.rules = [...input.rules];
  }
}
