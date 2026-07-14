import type { Rule, RuleDescriptor } from "./Rule";

interface RegisteredRule {
  readonly rule: Rule;
  enabled: boolean;
}

export class RuleRegistry {
  private readonly rules = new Map<string, RegisteredRule>();

  registerRule(rule: Rule): void {
    if (this.rules.has(rule.id)) throw new Error(`Rule already registered: ${rule.id}`);
    this.rules.set(rule.id, { rule, enabled: rule.enabled });
  }

  unregisterRule(id: string): boolean {
    return this.rules.delete(id);
  }

  enableRule(id: string): void {
    this.requireRule(id).enabled = true;
  }

  disableRule(id: string): void {
    this.requireRule(id).enabled = false;
  }

  listRules(): readonly RuleDescriptor[] {
    return [...this.rules.values()].map(({ rule, enabled }) => ({
      id: rule.id,
      displayName: rule.displayName,
      description: rule.description,
      severity: rule.severity,
      enabled
    }));
  }

  getRule(id: string): Rule | undefined {
    return this.rules.get(id)?.rule;
  }

  isEnabled(id: string): boolean {
    return this.requireRule(id).enabled;
  }

  getEnabledRules(): readonly Rule[] {
    return [...this.rules.values()]
      .filter((entry) => entry.enabled)
      .map((entry) => entry.rule);
  }

  private requireRule(id: string): RegisteredRule {
    const entry = this.rules.get(id);
    if (!entry) throw new Error(`Rule not found: ${id}`);
    return entry;
  }
}
