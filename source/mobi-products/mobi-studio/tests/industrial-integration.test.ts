import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  IndustrialIntegrationCoordinator,
  MIC_VERSION,
  type IndustrialContractSnapshot,
} from "../src/index";

function snapshot(): IndustrialContractSnapshot {
  return {
    manifest: {
      contract: "mobi.production-manifest",
      version: MIC_VERSION,
      projectId: "project-1",
      exportId: "export-1",
      state: "COMPLETED",
      progress: 100,
      indicators: { partCount: 1, hardwareCount: 0, operationCount: 1 },
      parts: [
        {
          partId: "part-1",
          manufacturingId: "manufacturing-1",
          sourceEntityId: "part-1",
          status: "READY",
        },
      ],
    },
    bom: {
      contract: "mobi.bom-output",
      version: MIC_VERSION,
      projectId: "project-1",
      lines: [],
      totals: { partCount: 1, hardwareCount: 0, areaMm2: 0, volumeMm3: 0 },
      groupingKeys: [],
    },
    cam: {
      contract: "mobi.neutral-cam-package",
      version: MIC_VERSION,
      projectId: "project-1",
      sourceContractVersion: "1.0.0",
      layers: ["CUT_OUTLINE"],
      paths: [],
      operations: [],
      bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    },
    feedback: {
      snapshot: () => [],
      subscribe: () => () => {},
    },
    transactions: {
      record: vi.fn(() => ({ success: true, transactionId: "tx-1" })),
    },
  };
}

describe("CP002-A industrial contracts consumers", () => {
  it("connects a valid MIC 1.1.0 snapshot and exposes connection state", () => {
    const contracts = snapshot();
    const coordinator = new IndustrialIntegrationCoordinator();

    expect(coordinator.getState()).toEqual({
      status: "DISCONNECTED",
      connected: false,
      projectId: null,
      micVersion: null,
      lifecycleSequence: 0,
    });
    expect(coordinator.connect(contracts)).toEqual({
      status: "CONNECTED",
      connected: true,
      projectId: "project-1",
      micVersion: MIC_VERSION,
      lifecycleSequence: 1,
    });
    expect(coordinator.getContracts()).toBe(contracts);
  });

  it("disconnects the current snapshot and makes contracts unavailable", () => {
    const coordinator = new IndustrialIntegrationCoordinator();
    coordinator.connect(snapshot());

    expect(coordinator.disconnect()).toEqual({
      status: "DISCONNECTED",
      connected: false,
      projectId: null,
      micVersion: null,
      lifecycleSequence: 2,
    });
    expect(() => coordinator.getContracts()).toThrow("INDUSTRIAL_NOT_CONNECTED");
    expect(() => coordinator.disconnect()).toThrow("INDUSTRIAL_NOT_CONNECTED");
  });

  it("blocks a snapshot with an incompatible MIC version", () => {
    const contracts = snapshot();
    const incompatible = {
      ...contracts,
      manifest: { ...contracts.manifest, version: "2.0.0" },
    } as unknown as IndustrialContractSnapshot;

    const coordinator = new IndustrialIntegrationCoordinator();
    expect(() => coordinator.connect(incompatible)).toThrow("MIC_VERSION_INCOMPATIBLE");
    expect(coordinator.getState().connected).toBe(false);
  });

  it("blocks snapshots whose public contracts disagree on projectId", () => {
    const contracts = snapshot();
    const mismatched = {
      ...contracts,
      bom: { ...contracts.bom, projectId: "project-2" },
    };

    const coordinator = new IndustrialIntegrationCoordinator();
    expect(() => coordinator.connect(mismatched)).toThrow(
      "INDUSTRIAL_PROJECT_ID_MISMATCH",
    );
    expect(coordinator.getState().connected).toBe(false);

    const blankProject = {
      ...contracts,
      manifest: { ...contracts.manifest, projectId: " " },
      bom: { ...contracts.bom, projectId: " " },
      cam: { ...contracts.cam, projectId: " " },
    };
    expect(() => coordinator.connect(blankProject)).toThrow(
      "INDUSTRIAL_PROJECT_ID_INVALID",
    );
  });

  it("blocks null and undefined snapshots", () => {
    const coordinator = new IndustrialIntegrationCoordinator();
    expect(() => coordinator.connect(null)).toThrow("INDUSTRIAL_SNAPSHOT_REQUIRED");
    expect(() => coordinator.connect(undefined)).toThrow("INDUSTRIAL_SNAPSHOT_REQUIRED");
    expect(() =>
      coordinator.connect({
        ...snapshot(),
        feedback: null,
      } as unknown as IndustrialContractSnapshot),
    ).toThrow("INDUSTRIAL_CONTRACT_INVALID");
  });

  it("blocks a second connection without replacing the active snapshot", () => {
    const first = snapshot();
    const second = {
      ...snapshot(),
      manifest: { ...snapshot().manifest, projectId: "project-2" },
      bom: { ...snapshot().bom, projectId: "project-2" },
      cam: { ...snapshot().cam, projectId: "project-2" },
    };
    const coordinator = new IndustrialIntegrationCoordinator();
    coordinator.connect(first);

    expect(() => coordinator.connect(second)).toThrow("INDUSTRIAL_ALREADY_CONNECTED");
    expect(coordinator.getContracts()).toBe(first);
    expect(coordinator.getState().projectId).toBe("project-1");
  });

  it("imports Constructor contracts only through its public entrypoint", () => {
    const root = resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../src/industrial-integration",
    );
    const files = typescriptFiles(root);
    const imports = files.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => ({
        file: relative(root, file),
        specifier: match[1]!,
      }));
    });
    const constructorImports = imports.filter(({ specifier }) =>
      specifier.includes("mobi-constructor"),
    );

    expect(constructorImports).toEqual([
      {
        file: "IndustrialContracts.ts",
        specifier: "../../../mobi-constructor/src/index",
      },
    ]);
    expect(
      constructorImports.some(({ specifier }) =>
        /\/(pipelines?|providers?|managers?|builders?|engines?|public-industrial-contracts)\//i.test(
          specifier,
        ),
      ),
    ).toBe(false);
  });
});

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
