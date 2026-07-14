import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  MIC_VERSION,
  ProductionDashboardController,
  type ProductionDashboardRenderer,
  type ProductionManifest,
} from "../src/index";

function manifest(partCount = 2): ProductionManifest {
  return {
    contract: "mobi.production-manifest",
    version: MIC_VERSION,
    projectId: "project-1",
    exportId: "production-1",
    state: "COMPLETED",
    progress: 100,
    indicators: { partCount, hardwareCount: 3, operationCount: 4 },
    parts: Array.from({ length: partCount }, (_, index) => ({
      partId: `part-${index}`,
      manufacturingId: `manufacturing-${index}`,
      sourceEntityId: `entity-${index}`,
      status: index ? "REJECTED" : "COMPLETED",
    })),
  };
}

describe("CP002-B Production Dashboard", () => {
  it("renders only direct fields from a valid ProductionManifest", () => {
    const controller = new ProductionDashboardController();
    const view = controller.connect(manifest());

    expect(view).toEqual({
      component: "PRODUCTION_DASHBOARD",
      hasData: true,
      fields: {
        projectName: "Indisponível",
        productionStatus: "COMPLETED",
        progress: "100",
        totalParts: "2",
        producedParts: "Indisponível",
        pendingParts: "Indisponível",
        failedParts: "Indisponível",
        updatedAt: "Indisponível",
        manifestVersion: "1.1.0",
        micVersion: "1.1.0",
        productionId: "production-1",
      },
    });
  });

  it("preserves zero values from an empty manifest without deriving counts", () => {
    const view = new ProductionDashboardController().connect(manifest(0));

    expect(view.fields.totalParts).toBe("0");
    expect(view.fields.producedParts).toBe("Indisponível");
    expect(view.fields.pendingParts).toBe("Indisponível");
    expect(view.fields.failedParts).toBe("Indisponível");
  });

  it("renders every absent field as unavailable for an incomplete manifest", () => {
    const view = new ProductionDashboardController().connect({});

    expect(view.hasData).toBe(true);
    expect(Object.values(view.fields).every((value) => value === "Indisponível")).toBe(true);
  });

  it("presents only optional fields that are actually present", () => {
    const view = new ProductionDashboardController().connect({
      version: MIC_VERSION,
      exportId: "production-partial",
    });

    expect(view.fields.manifestVersion).toBe("1.1.0");
    expect(view.fields.micVersion).toBe("1.1.0");
    expect(view.fields.productionId).toBe("production-partial");
    expect(view.fields.productionStatus).toBe("Indisponível");
    expect(view.fields.totalParts).toBe("Indisponível");
  });

  it("replaces the view model when a new manifest snapshot arrives", () => {
    const controller = new ProductionDashboardController();
    controller.connect(manifest(1));
    const updated = controller.update({
      ...manifest(4),
      exportId: "production-2",
    });

    expect(updated.fields.totalParts).toBe("4");
    expect(updated.fields.productionId).toBe("production-2");
    expect(controller.getState().snapshotSequence).toBe(2);
  });

  it("clears all presented data on disconnect", () => {
    const controller = new ProductionDashboardController();
    controller.connect(manifest());
    const disconnected = controller.disconnect();

    expect(disconnected.hasData).toBe(false);
    expect(Object.values(disconnected.fields).every((value) => value === "Indisponível")).toBe(
      true,
    );
    expect(controller.getState()).toMatchObject({ status: "NO_DATA", snapshotSequence: 2 });
  });

  it("renders the minimal no-data component without a manifest", () => {
    const renderer: ProductionDashboardRenderer = { render: vi.fn() };
    const controller = new ProductionDashboardController(undefined, undefined, renderer);
    const view = controller.render();

    expect(view.hasData).toBe(false);
    expect(view.component).toBe("PRODUCTION_DASHBOARD");
    expect(renderer.render).toHaveBeenCalledOnce();
    expect(renderer.render).toHaveBeenCalledWith(view);
  });

  it("keeps the dashboard isolated from every non-manifest industrial contract", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src/production-dashboard");
    const source = typescriptFiles(root)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).toContain("ProductionManifest");
    expect(source).not.toMatch(
      /\b(BOMOutput|NeutralCAMPackage|ProductionFeedbackStream|IndustrialTransactionPort|IndustrialContractSnapshot)\b/,
    );
    expect(source).not.toContain("mobi-constructor/");
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
