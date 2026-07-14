import type { Rule } from "../rules/Rule";
import { RuleRegistry } from "../rules/RuleRegistry";
import { RuleRunner } from "../rules/RuleRunner";
import type { RuleDescriptor, RulePackageDescriptor } from "./RuleDescriptor";
import { RuleLoader } from "./RuleLoader";
import { RulePackage } from "./RulePackage";

export class RuleBook {
  private readonly packages = new Map<string, RulePackage>();
  private readonly registry: RuleRegistry;
  private readonly loader: RuleLoader;
  readonly runner: RuleRunner;

  constructor(registry = new RuleRegistry()) {
    this.registry = registry;
    this.loader = new RuleLoader(registry);
    this.runner = new RuleRunner(registry);
  }

  registerPackage(rulePackage: RulePackage): void {
    if (this.packages.has(rulePackage.id)) throw new Error(`Package already registered: ${rulePackage.id}`);
    this.assertUniqueRuleIds(rulePackage.rules);
    this.packages.set(rulePackage.id, rulePackage);
  }

  unregisterPackage(id: string): boolean {
    if (this.loader.isLoaded(id)) throw new Error(`Package is loaded: ${id}`);
    return this.packages.delete(id);
  }

  loadPackage(id: string): void {
    this.loader.loadPackage(this.requirePackage(id));
  }

  unloadPackage(id: string): void {
    this.requirePackage(id);
    this.loader.unloadPackage(id);
  }

  listPackages(): readonly RulePackageDescriptor[] {
    return [...this.packages.values()].map((rulePackage) => ({
      id: rulePackage.id,
      displayName: rulePackage.displayName,
      description: rulePackage.description,
      categoryId: rulePackage.category.id,
      version: rulePackage.metadata.version,
      loaded: this.loader.isLoaded(rulePackage.id),
      ruleCount: rulePackage.rules.length
    }));
  }

  listRules(): readonly RuleDescriptor[] {
    return [...this.packages.values()].flatMap((rulePackage) =>
      rulePackage.rules.map((rule) => ({
        packageId: rulePackage.id,
        id: rule.id,
        displayName: rule.displayName,
        description: rule.description,
        severity: rule.severity,
        enabled: rule.enabled,
        loaded: this.loader.isLoaded(rulePackage.id)
      }))
    );
  }

  private requirePackage(id: string): RulePackage {
    const rulePackage = this.packages.get(id);
    if (!rulePackage) throw new Error(`Package not found: ${id}`);
    return rulePackage;
  }

  private assertUniqueRuleIds(rules: readonly Rule[]): void {
    const ids = new Set<string>();
    for (const rule of rules) {
      if (ids.has(rule.id)) throw new Error(`Duplicate rule in package: ${rule.id}`);
      ids.add(rule.id);
    }
  }
}
