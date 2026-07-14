import { RuleRegistry } from "../rules/RuleRegistry";
import type { RulePackage } from "./RulePackage";

export class RuleLoader {
  private readonly loaded = new Map<string, readonly string[]>();

  constructor(private readonly registry: RuleRegistry) {}

  loadPackage(rulePackage: RulePackage): void {
    if (this.loaded.has(rulePackage.id)) throw new Error(`Package already loaded: ${rulePackage.id}`);
    const registered: string[] = [];
    try {
      for (const rule of rulePackage.rules) {
        this.registry.registerRule(rule);
        registered.push(rule.id);
      }
      this.loaded.set(rulePackage.id, registered);
    } catch (error: unknown) {
      for (const id of registered) this.registry.unregisterRule(id);
      throw error;
    }
  }

  unloadPackage(id: string): void {
    const ruleIds = this.loaded.get(id);
    if (!ruleIds) throw new Error(`Package not loaded: ${id}`);
    for (const ruleId of ruleIds) this.registry.unregisterRule(ruleId);
    this.loaded.delete(id);
  }

  isLoaded(id: string): boolean {
    return this.loaded.has(id);
  }
}
