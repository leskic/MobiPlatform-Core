import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const productRoots = [
  "mobi-products/mobi-studio/src",
  "mobi-products/mobi-studio/tests",
  "mobi-products/mobi-constructor/src",
  "mobi-products/mobi-constructor/tests",
];

function typescriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? typescriptFiles(path)
      : path.endsWith(".ts")
        ? [path]
        : [];
  });
}

function forbiddenImports(): string[] {
  const importPattern = new RegExp("(?:from\\s*|import\\s*)[\"']([^\"']+)[\"']", "g");
  const forbiddenSegments = ["apps", "builder", "origin", "transaction", "foundation", "mobi-products"];
  const violations: string[] = [];

  for (const root of productRoots) {
    for (const file of typescriptFiles(resolve(workspace, root))) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(importPattern)) {
        const specifier = match[1]!;
        const segments = specifier.split("/").filter((segment) => segment && segment !== "." && segment !== "..");
        if (segments.some((segment) => forbiddenSegments.includes(segment))) {
          violations.push(`${relative(workspace, file)} -> ${specifier}`);
        }
      }
    }
  }

  return violations;
}

describe("cross-product architecture boundary", () => {
  it("blocks imports from platform internals, apps, builders and other products", () => {
    expect(forbiddenImports()).toEqual([]);
  });
});
