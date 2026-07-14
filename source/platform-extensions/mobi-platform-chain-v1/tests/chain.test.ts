import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { MobiConstructorPublicFlow } from "../../../mobi-products/mobi-constructor/src/index";
import { MobiLevantamentoProducer } from "../../../mobi-products/mobi-levantamento/src/index";
import { MobiViewIntegration } from "../../../mobi-products/mobi-view/src/index";
import { PlatformProjectAdapter } from "../src/PlatformProjectAdapter";
import type { MobiLevantamentoInputV1, MobiViewFeedbackEventV1 } from "../src/contracts";

const projectId = "11111111-1111-4111-8111-111111111111";
const environmentId = "22222222-2222-4222-8222-222222222222";
const wallId = "33333333-3333-4333-8333-333333333333";
const moduleId = "44444444-4444-4444-8444-444444444444";
const partId = "55555555-5555-4555-8555-555555555555";
const zero = { x: 0, y: 0, z: 0 };
const edgeBanding = {
  top: { applied: false }, bottom: { applied: false }, left: { applied: false },
  right: { applied: false }, front: { applied: false }, back: { applied: false },
};

function input(): MobiLevantamentoInputV1 {
  return {
    contract: "mobi.levantamento-input",
    version: "1.0.0",
    project: {
      id: projectId,
      displayName: "Field Survey",
      code: "SURVEY-001",
      source: "mobi-levantamento",
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z",
    },
    environments: [{
      id: environmentId,
      displayName: "Kitchen",
      code: "KIT",
      order: 1,
      architectures: [{
        id: wallId, type: "wall", size: { width: 3000, height: 2600, depth: 100 },
        position: zero, rotation: zero, referencePlane: { x: 0, y: 1, z: 0 }, finish: "paint",
      }],
      modules: [{
        id: moduleId, code: "M1", displayName: "Base", type: "base", position: zero, rotation: zero,
        parts: [{
          id: partId, category: "structural", type: "side_panel",
          size: { width: 600, height: 700, thickness: 18 }, position: zero, rotation: zero,
          materialId: "MDF-18", edgeBanding, grainDirection: "lengthwise",
        }],
      }],
    }],
  };
}

function fingerprint(raw: string): string {
  let hash = 2166136261;
  for (const char of raw) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

describe("Mobi Platform Checkpoint 001 public chain", () => {
  it("produces identical Projeto.mobi envelopes for identical survey input", () => {
    const producer = new MobiLevantamentoProducer(new PlatformProjectAdapter());
    const first = producer.generate(input());
    const second = producer.generate(input());
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      contract: "mobi.project-envelope", version: "1.0.0", schemaVersion: "1.0.0",
      projectId, mediaType: "application/vnd.mobi.project+json",
    });
    expect(first.fingerprint).toMatch(/^[0-9a-f]{8}$/);
    expect(JSON.parse(first.payload)).toMatchObject({ id: projectId, source: "mobi-levantamento" });
  });

  it("executes Levantamento to Constructor to MobiView exclusively through public contracts", () => {
    const adapter = new PlatformProjectAdapter();
    const envelope = new MobiLevantamentoProducer(adapter).generate(input());
    const coordinator = { execute: vi.fn(() => ({ success: true, transactionId: "view-tx" })) };
    const contracts = new MobiConstructorPublicFlow(adapter).execute(envelope, {
      sequence: 1,
      sheet: { width: 1500, height: 1000, margin: 10, kerf: 4 },
      logs: [{ id: "log-1", partId, timestamp: 1, status: "COMPLETED" }],
      telemetry: [{ id: "tel-1", partId, timestamp: 2, metric: "temperature", value: 21, unit: "C" }],
      ruleRunner: { analyze: vi.fn(() => []) },
      cognitiveGate: { analyze: vi.fn(() => ({ status: "HEALTHY" as const, diagnostics: [] })) },
      cognitiveEvents: { publish: vi.fn() },
      exportRegistrar: { register: vi.fn(() => ({ success: true, transactionId: "export-tx" })) },
      traceRegistrar: { register: vi.fn(() => ({ success: true, transactionId: "trace-tx" })) },
      transactionCoordinator: coordinator,
    });
    const view = new MobiViewIntegration();
    const snapshot = view.connect(contracts);
    expect(snapshot).toMatchObject({
      projectId,
      production: { state: "COMPLETED", progress: 100, partCount: 1 },
      bomRows: 1,
      cam: { layers: ["CUT_OUTLINE"], paths: 1 },
    });
    expect(snapshot.timeline).toHaveLength(2);
    expect(coordinator.execute).toHaveBeenCalledWith(expect.objectContaining({ operationName: "INDUSTRIAL_VIEWED" }));
    expect(view.disconnect()).toBe(true);
    expect(view.disconnect()).toBe(false);
    expect(() => view.snapshot()).toThrow("MOBI_VIEW_NOT_CONNECTED");
  });

  it("rejects invalid, tampered and mismatched public envelopes", () => {
    const adapter = new PlatformProjectAdapter();
    const envelope = adapter.produce(input());
    expect(() => adapter.read({ ...envelope, fingerprint: "00000000" })).toThrow("PROJECT_ENVELOPE_FINGERPRINT_MISMATCH");
    expect(() => adapter.read({ ...envelope, version: "bad" as never })).toThrow("UNSUPPORTED_PROJECT_ENVELOPE");
    expect(() => adapter.read({ ...envelope, schemaVersion: "bad" as never })).toThrow("UNSUPPORTED_PROJECT_ENVELOPE");
    expect(() => adapter.read({ ...envelope, mediaType: "bad" as never })).toThrow("UNSUPPORTED_PROJECT_ENVELOPE");
    expect(() => adapter.read({ ...envelope, projectId: "other" })).toThrow("PROJECT_ENVELOPE_ID_MISMATCH");
    expect(() => adapter.read({ ...envelope, payload: "not-json", fingerprint: fingerprint("not-json") })).toThrow("INVALID_PROJECT_ENVELOPE");
    expect(() => adapter.produce({ ...input(), environments: [] })).toThrow("INVALID_LEVANTAMENTO_INPUT");
    expect(() => adapter.produce({ ...input(), contract: "bad" as never })).toThrow("INVALID_LEVANTAMENTO_INPUT");
    expect(() => adapter.produce({ ...input(), version: "bad" as never })).toThrow("INVALID_LEVANTAMENTO_INPUT");
    expect(() => adapter.produce({ ...input(), project: { ...input().project, id: "" } })).toThrow("INVALID_LEVANTAMENTO_INPUT");
    const source = input();
    expect(() => adapter.produce({ ...source, environments: [{ ...source.environments[0]!, id: projectId }] })).toThrow("INVALID_LEVANTAMENTO_INPUT");
    expect(() => adapter.produce({ ...source, environments: [{ ...source.environments[0]!, architectures: [{ ...source.environments[0]!.architectures[0]!, id: environmentId }] }] })).toThrow("INVALID_LEVANTAMENTO_INPUT");
    expect(() => adapter.produce({ ...source, environments: [{ ...source.environments[0]!, modules: [{ ...source.environments[0]!.modules[0]!, id: wallId }] }] })).toThrow("INVALID_LEVANTAMENTO_INPUT");
    expect(() => adapter.produce({ ...source, environments: [{ ...source.environments[0]!, modules: [{ ...source.environments[0]!.modules[0]!, parts: [{ ...source.environments[0]!.modules[0]!.parts[0]!, id: moduleId }] }] }] })).toThrow("INVALID_LEVANTAMENTO_INPUT");
  });

  it("updates MobiView incrementally from the public feedback subscription", () => {
    const adapter = new PlatformProjectAdapter();
    const envelope = new MobiLevantamentoProducer(adapter).generate(input());
    const contracts = new MobiConstructorPublicFlow(adapter).execute(envelope, {
      sequence: 1,
      sheet: { width: 1500, height: 1000, margin: 10, kerf: 4 },
      logs: [], telemetry: [], ruleRunner: { analyze: () => [] },
      cognitiveGate: { analyze: () => ({ status: "HEALTHY", diagnostics: [] }) },
      cognitiveEvents: { publish: () => {} },
      exportRegistrar: { register: () => ({ success: true, transactionId: "export" }) },
      traceRegistrar: { register: () => ({ success: true, transactionId: "trace" }) },
      transactionCoordinator: { execute: () => ({ success: true, transactionId: "view" }) },
    });
    let emit: ((event: MobiViewFeedbackEventV1) => void) | undefined;
    const feedback = {
      snapshot: () => contracts.feedback.snapshot(),
      subscribe: (listener: (event: (ReturnType<typeof contracts.feedback.snapshot>)[number]) => void) => { emit = listener; return vi.fn(); },
    };
    const view = new MobiViewIntegration();
    view.connect({ ...contracts, feedback });
    const event = { contract: "mobi.production-feedback-event" as const, version: "1.1.0" as const, eventId: "live", projectId, partId, logicalTimestamp: 9, status: "STARTED" as const };
    emit!(event);
    expect(view.snapshot().timeline.at(-1)).toEqual(event);
    view.connect({ ...contracts, feedback });
    expect(view.disconnect()).toBe(true);
  });

  it("contains no direct cross-product internal imports", () => {
    const levantamento = readFileSync(new URL("../../../mobi-products/mobi-levantamento/src/MobiLevantamentoProducer.ts", import.meta.url), "utf8");
    const view = readFileSync(new URL("../../../mobi-products/mobi-view/src/MobiViewIntegration.ts", import.meta.url), "utf8");
    expect(levantamento).not.toMatch(/mobi-constructor|mobi-view/);
    expect(view).not.toMatch(/mobi-constructor\/src\/(?!index)/);
    expect(view).not.toMatch(/industrial\/IndustrialTypes|closed-loop\/Phase3Types/);
  });
});
