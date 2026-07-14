import { describe, expect, it } from "vitest";
import { ProjectBuilder } from "../../builder/ProjectBuilder";
import { projectInput } from "../../builder/tests/fixture";
import type { Rule } from "../rules/Rule";
import { RuleContext } from "../rules/RuleContext";
import { RuleRegistry } from "../rules/RuleRegistry";
import { RuleBook } from "../rulebook/RuleBook";
import { RuleLoader } from "../rulebook/RuleLoader";
import { RulePackage } from "../rulebook/RulePackage";

function rule(id: string, enabled = true): Rule {
  return {
    id,
    displayName: `Rule ${id}`,
    description: `Infrastructure test ${id}`,
    severity: "info",
    enabled,
    analyze: () => [{ code: id, severity: "info", path: "/", message: id }]
  };
}

function packageOf(id: string, rules: readonly Rule[]): RulePackage {
  return new RulePackage({
    id,
    displayName: `Package ${id}`,
    description: `Infrastructure package ${id}`,
    category: { id: "technical", displayName: "Technical" },
    metadata: { version: "1.0.0", source: "test" },
    rules
  });
}

describe("Mobi Rulebook Foundation", () => {
  it("registers packages and enumerates packages and rules in order", () => {
    const book = new RuleBook();
    book.registerPackage(packageOf("PACKAGE_B", [rule("B1"), rule("B2", false)]));
    book.registerPackage(packageOf("PACKAGE_A", [rule("A1")]));
    expect(book.listPackages().map((item) => item.id)).toEqual(["PACKAGE_B", "PACKAGE_A"]);
    expect(book.listPackages()[0]).toMatchObject({
      categoryId: "technical", version: "1.0.0", loaded: false, ruleCount: 2
    });
    expect(book.listRules().map((item) => [item.id, item.enabled, item.loaded])).toEqual([
      ["B1", true, false], ["B2", false, false], ["A1", true, false]
    ]);
    expect(() => book.registerPackage(packageOf("PACKAGE_B", []))).toThrow(
      "Package already registered: PACKAGE_B"
    );
  });

  it("rejects duplicate rule IDs inside one package", () => {
    const book = new RuleBook();
    expect(() => book.registerPackage(packageOf("PACKAGE", [rule("SAME"), rule("SAME")]))).toThrow(
      "Duplicate rule in package: SAME"
    );
  });

  it("loads and unloads package rules through the registry", () => {
    const book = new RuleBook();
    book.registerPackage(packageOf("PACKAGE", [rule("ONE"), rule("TWO", false)]));
    book.loadPackage("PACKAGE");
    expect(book.listPackages()[0]?.loaded).toBe(true);
    expect(book.listRules().every((item) => item.loaded)).toBe(true);
    const context = new RuleContext(new ProjectBuilder().createProject(projectInput).build());
    expect(book.runner.runAll(context).map((result) => result.code)).toEqual(["ONE"]);
    expect(() => book.loadPackage("PACKAGE")).toThrow("Package already loaded: PACKAGE");
    book.unloadPackage("PACKAGE");
    expect(book.listPackages()[0]?.loaded).toBe(false);
    expect(book.runner.runAll(context)).toEqual([]);
    expect(() => book.unloadPackage("PACKAGE")).toThrow("Package not loaded: PACKAGE");
  });

  it("unregisters only unloaded packages", () => {
    const book = new RuleBook();
    book.registerPackage(packageOf("PACKAGE", [rule("ONE")]));
    book.loadPackage("PACKAGE");
    expect(() => book.unregisterPackage("PACKAGE")).toThrow("Package is loaded: PACKAGE");
    book.unloadPackage("PACKAGE");
    expect(book.unregisterPackage("PACKAGE")).toBe(true);
    expect(book.unregisterPackage("PACKAGE")).toBe(false);
  });

  it("reports missing packages", () => {
    const book = new RuleBook();
    expect(() => book.loadPackage("missing")).toThrow("Package not found: missing");
    expect(() => book.unloadPackage("missing")).toThrow("Package not found: missing");
  });

  it("rolls back a partial load when registry IDs conflict", () => {
    const registry = new RuleRegistry();
    const book = new RuleBook(registry);
    book.registerPackage(packageOf("FIRST", [rule("CONFLICT")]));
    book.registerPackage(packageOf("SECOND", [rule("TEMPORARY"), rule("CONFLICT")]));
    book.loadPackage("FIRST");
    expect(() => book.loadPackage("SECOND")).toThrow("Rule already registered: CONFLICT");
    expect(registry.getRule("TEMPORARY")).toBeUndefined();
    expect(book.listPackages().find((item) => item.id === "SECOND")?.loaded).toBe(false);
  });

  it("keeps package metadata and enumerations isolated", () => {
    const category = { id: "category", displayName: "Category" };
    const metadata = { version: "1.0.0", source: "test" };
    const rulePackage = new RulePackage({
      id: "PACKAGE", displayName: "Package", description: "Description",
      category, metadata, rules: [rule("ONE")]
    });
    category.id = "changed";
    metadata.version = "changed";
    const book = new RuleBook();
    book.registerPackage(rulePackage);
    expect(book.listPackages()[0]).toMatchObject({ categoryId: "category", version: "1.0.0" });
    const packages = book.listPackages().map((item) => ({ ...item }));
    const rules = book.listRules().map((item) => ({ ...item }));
    packages[0]!.id = "changed";
    rules[0]!.id = "changed";
    expect(book.listPackages()[0]?.id).toBe("PACKAGE");
    expect(book.listRules()[0]?.id).toBe("ONE");
  });

  it("exposes loader state without persistence", () => {
    const registry = new RuleRegistry();
    const loader = new RuleLoader(registry);
    const rulePackage = packageOf("PACKAGE", []);
    expect(loader.isLoaded("PACKAGE")).toBe(false);
    loader.loadPackage(rulePackage);
    expect(loader.isLoaded("PACKAGE")).toBe(true);
    loader.unloadPackage("PACKAGE");
    expect(loader.isLoaded("PACKAGE")).toBe(false);
  });
});
