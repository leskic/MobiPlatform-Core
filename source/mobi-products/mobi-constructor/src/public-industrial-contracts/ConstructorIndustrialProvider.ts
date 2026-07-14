import {
  MIC_VERSION,
  type BOMOutput,
  type CAMBounds,
  type IndustrialContractSnapshot,
  type IndustrialTransactionCoordinatorPort,
  type NeutralCAMPackage,
  type ProductionFeedbackEvent,
  type ProductionManifest,
} from "./MICContracts";
import { IndustrialTransactionAdapter } from "./IndustrialTransactionAdapter";
import { ProductionFeedbackChannel } from "./ProductionFeedbackChannel";
import type {
  ProviderClosedLoopOutput,
  ProviderIndustrialOutput,
} from "./MICProviderSource";

export class ConstructorIndustrialProvider {
  private readonly feedbackChannels = new Map<string, ProductionFeedbackChannel>();
  private readonly feedbackPartIds = new Map<string, ReadonlySet<string>>();

  constructor(private readonly coordinator: IndustrialTransactionCoordinatorPort) {}

  provide(
    industrial: Readonly<ProviderIndustrialOutput>,
    closedLoop: Readonly<ProviderClosedLoopOutput>,
  ): IndustrialContractSnapshot {
    this.assertCompatible(industrial, closedLoop);
    const feedback = this.feedback(industrial.manufacturing.projectId, closedLoop);
    return {
      manifest: this.manifest(industrial, closedLoop),
      bom: this.bom(industrial),
      cam: this.cam(industrial, closedLoop),
      feedback,
      transactions: new IndustrialTransactionAdapter(this.coordinator),
    };
  }

  publishFeedback(event: ProductionFeedbackEvent): void {
    const channel = this.feedbackChannels.get(event.projectId);
    const partIds = this.feedbackPartIds.get(event.projectId);
    if (
      !channel ||
      !partIds?.has(event.partId) ||
      event.contract !== "mobi.production-feedback-event" ||
      event.version !== MIC_VERSION ||
      !event.eventId.trim() ||
      !Number.isSafeInteger(event.logicalTimestamp) ||
      event.logicalTimestamp < 0 ||
      channel.snapshot().some((current) => current.eventId === event.eventId)
    ) {
      throw new Error("MIC_INVALID_FEEDBACK_EVENT");
    }
    channel.publish(event);
  }

  private manifest(
    industrial: Readonly<ProviderIndustrialOutput>,
    closedLoop: Readonly<ProviderClosedLoopOutput>,
  ): ProductionManifest {
    const feedbackStatus = new Map(closedLoop.feedback.logs.map((log) => [log.partId, log.status]));
    return {
      contract: "mobi.production-manifest",
      version: MIC_VERSION,
      projectId: industrial.manufacturing.projectId,
      exportId: industrial.exportTransactionId,
      state: "COMPLETED",
      progress: 100,
      indicators: {
        partCount: industrial.manufacturing.parts.length,
        hardwareCount: industrial.manufacturing.hardware.length,
        operationCount: industrial.manufacturing.parts.reduce(
          (count, part) => count + part.operations.length,
          0,
        ),
      },
      parts: industrial.manufacturing.parts.map((part) => ({
        partId: part.sourceProductId,
        manufacturingId: part.id,
        sourceEntityId: part.sourceProductId,
        status: feedbackStatus.get(part.sourceProductId) ?? "READY",
      })),
    };
  }

  private bom(industrial: Readonly<ProviderIndustrialOutput>): BOMOutput {
    const lines = industrial.bom.lines.map((line) => ({
      id: `bom:${industrial.bom.projectId}:${line.kind}:${line.key}`,
      kind: line.kind,
      key: line.key,
      quantity: line.quantity,
      areaMm2: line.areaMm2,
      volumeMm3: line.volumeMm3,
      sourceEntityIds: structuredClone(line.sourceIds),
    }));
    return {
      contract: "mobi.bom-output",
      version: MIC_VERSION,
      projectId: industrial.bom.projectId,
      lines,
      totals: structuredClone(industrial.bom.totals),
      groupingKeys: [...new Set(lines.map((line) => `${line.kind}:${line.key}`))].sort(),
    };
  }

  private cam(
    industrial: Readonly<ProviderIndustrialOutput>,
    closedLoop: Readonly<ProviderClosedLoopOutput>,
  ): NeutralCAMPackage {
    const neutral = closedLoop.cam.find((artifact) => artifact.format === "NEUTRAL_CAM");
    if (!neutral) throw new Error("MIC_NEUTRAL_CAM_SOURCE_MISSING");
    const parts = new Map(industrial.manufacturing.parts.map((part) => [part.sourceProductId, part]));
    const paths = closedLoop.nesting.sheets.flatMap((sheet) =>
      sheet.placements.map((placement) => ({
        id: `cam:path:${placement.sheetId}:${placement.partId}`,
        partId: placement.partId,
        sheetId: placement.sheetId,
        entityId: placement.partId,
        layer: "CUT_OUTLINE" as const,
        closed: true as const,
        points: [
          { x: placement.x, y: placement.y },
          { x: placement.x + placement.width, y: placement.y },
          { x: placement.x + placement.width, y: placement.y + placement.height },
          { x: placement.x, y: placement.y + placement.height },
          { x: placement.x, y: placement.y },
        ],
        bounds: {
          minX: placement.x,
          minY: placement.y,
          maxX: placement.x + placement.width,
          maxY: placement.y + placement.height,
        },
      })),
    );
    const pathByPart = new Map(paths.map((path) => [path.partId, path.id]));
    const operations = [...parts.values()].flatMap((part) =>
      part.operations.map((operation) => ({
        id: operation.id,
        partId: part.sourceProductId,
        entityId: operation.sourcePartId,
        kind: operation.kind,
        pathId: pathByPart.get(part.sourceProductId) ?? "",
        parameters: structuredClone(operation.parameters),
      })),
    );
    if (operations.some((operation) => !operation.pathId)) {
      throw new Error("MIC_CAM_TRACEABILITY_MISSING");
    }
    return {
      contract: "mobi.neutral-cam-package",
      version: MIC_VERSION,
      projectId: closedLoop.nesting.projectId,
      sourceContractVersion: neutral.contractVersion,
      layers: ["CUT_OUTLINE"],
      paths,
      operations,
      bounds: this.bounds(paths.map((path) => path.bounds)),
    };
  }

  private feedback(
    projectId: string,
    closedLoop: Readonly<ProviderClosedLoopOutput>,
  ): ProductionFeedbackChannel {
    const channel = new ProductionFeedbackChannel();
    const events: ProductionFeedbackEvent[] = [
      ...closedLoop.feedback.logs.map((log) => ({
        contract: "mobi.production-feedback-event" as const,
        version: MIC_VERSION,
        eventId: log.id,
        projectId,
        partId: log.partId,
        logicalTimestamp: log.timestamp,
        status: log.status,
      })),
      ...closedLoop.feedback.telemetry.map((item) => ({
        contract: "mobi.production-feedback-event" as const,
        version: MIC_VERSION,
        eventId: item.id,
        projectId,
        partId: item.partId,
        logicalTimestamp: item.timestamp,
        status: "TELEMETRY" as const,
        telemetry: { metric: item.metric, value: item.value, unit: item.unit },
      })),
    ].sort((a, b) => a.logicalTimestamp - b.logicalTimestamp || a.eventId.localeCompare(b.eventId));
    for (const event of events) channel.publish(event);
    this.feedbackChannels.set(projectId, channel);
    this.feedbackPartIds.set(
      projectId,
      new Set(closedLoop.manufacturing.parts.map((part) => part.sourceProductId)),
    );
    return channel;
  }

  private bounds(bounds: readonly CAMBounds[]): CAMBounds {
    if (!bounds.length) throw new Error("MIC_CAM_PATHS_EMPTY");
    return {
      minX: Math.min(...bounds.map((value) => value.minX)),
      minY: Math.min(...bounds.map((value) => value.minY)),
      maxX: Math.max(...bounds.map((value) => value.maxX)),
      maxY: Math.max(...bounds.map((value) => value.maxY)),
    };
  }

  private assertCompatible(
    industrial: Readonly<ProviderIndustrialOutput>,
    closedLoop: Readonly<ProviderClosedLoopOutput>,
  ): void {
    const projectId = industrial.manufacturing.projectId;
    if (
      !projectId.trim() ||
      industrial.bom.projectId !== projectId ||
      closedLoop.manufacturing.projectId !== projectId ||
      closedLoop.nesting.projectId !== projectId ||
      closedLoop.verification.projectId !== projectId
    ) {
      throw new Error("MIC_PROJECT_MISMATCH");
    }
  }
}
