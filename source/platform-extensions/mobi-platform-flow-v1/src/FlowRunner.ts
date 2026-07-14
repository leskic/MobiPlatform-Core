import { StudioApplication } from "../../../mobi-products/mobi-studio/src/index";
import {
  MobiConstructorPublicFlow,
  type ConstructorPublicFlowContext,
  type IndustrialContractSnapshot,
  type IndustrialTransactionCoordinatorPort,
} from "../../../mobi-products/mobi-constructor/src/index";
import { MobiViewIntegration, type MobiViewSnapshot } from "../../../mobi-products/mobi-view/src/index";
import { ProjectSerializer } from "../../../codec/ProjectSerializer";
import type { Project } from "../../../builder/types/ProjectTypes";
import { PlatformProjectAdapter, type ProjectMobiEnvelopeV1 } from "../../mobi-platform-chain-v1/src/index";
import type { FlowExecutionContext } from "./FlowExecutionContext";
import type { FlowExecutionError, FlowExecutionResult } from "./FlowExecutionResult";
import { FlowLogger } from "./FlowLogger";
import { FlowValidation } from "./FlowValidation";

interface FlowRunnerDependencies {
  readonly createStudio?: (project: Project, context: FlowExecutionContext) => StudioApplication;
  readonly createConstructorFlow?: () => MobiConstructorPublicFlow;
  readonly createView?: () => MobiViewIntegration;
}

export class FlowRunner {
  constructor(
    private readonly adapter = new PlatformProjectAdapter(),
    private readonly validation = new FlowValidation(),
    private readonly logger = new FlowLogger(),
    private readonly dependencies: FlowRunnerDependencies = {},
  ) {}

  execute(context: FlowExecutionContext): FlowExecutionResult {
    const sessionId = context.sessionId ?? "cp003-flow";
    let projectId: string | null = null;
    let envelope: ProjectMobiEnvelopeV1 | undefined;
    let snapshot: IndustrialContractSnapshot | undefined;
    let viewSnapshot: MobiViewSnapshot | undefined;
    let studio: StudioApplication | undefined;
    const view = this.dependencies.createView?.() ?? new MobiViewIntegration();

    try {
      envelope = this.logger.measure("LOAD_PROJECT", () => this.loadProject(context.project));
      projectId = envelope.projectId;
      this.logger.info(`Projeto.mobi loaded: ${projectId}`);

      this.logger.measure("VALIDATE_SCHEMA", () => this.validation.validateEnvelope(envelope!));
      this.logger.info("Schema validation passed");

      studio = this.logger.measure("OPEN_STUDIO", () => this.openStudio(envelope!, context));
      this.logger.info(`Mobi Studio opened with ${studio.getState().sceneNodes} scene nodes`);

      snapshot = this.logger.measure("RUN_CONSTRUCTOR", () =>
        (this.dependencies.createConstructorFlow?.() ?? new MobiConstructorPublicFlow(this.adapter)).execute(
          envelope!,
          this.constructorContext(context, projectId!),
        ),
      );
      this.logger.info("MobiConstructor public flow executed");

      this.logger.measure("GENERATE_SNAPSHOT", () => this.validation.validateIndustrialSnapshot(snapshot!, projectId!));
      this.logger.info("Industrial snapshot validated");

      viewSnapshot = this.logger.measure("DELIVER_MOBI_VIEW", () => view.connect(snapshot!));
      this.logger.info("MobiView received industrial snapshot");

      this.logger.measure("VALIDATE_VIEW", () => this.validation.validateView(viewSnapshot!, projectId!));
      this.logger.info("MobiView return validated");

      this.logger.measure("CLEANUP", () => {
        view.disconnect();
        studio?.stop();
      });

      const report = this.logger.report("APPROVED", projectId, sessionId);
      return Object.freeze({
        success: true,
        status: "APPROVED",
        projectId,
        envelope,
        industrialSnapshot: snapshot,
        viewSnapshot,
        timings: report.steps,
        errors: report.errors,
        report,
      });
    } catch (error) {
      const flowError = this.toError(error);
      this.logger.error(flowError);
      this.logger.measure("CLEANUP", () => {
        view.disconnect();
        try {
          studio?.stop();
        } catch {
          // Best-effort cleanup keeps the original structured error intact.
        }
      });
      const report = this.logger.report("FAILED", projectId, sessionId);
      return Object.freeze({
        success: false,
        status: "FAILED",
        projectId,
        ...(envelope ? { envelope } : {}),
        ...(snapshot ? { industrialSnapshot: snapshot } : {}),
        ...(viewSnapshot ? { viewSnapshot } : {}),
        timings: report.steps,
        errors: report.errors,
        report,
      });
    }
  }

  private loadProject(project: FlowExecutionContext["project"]): ProjectMobiEnvelopeV1 {
    if (typeof project === "string") {
      const parsed = JSON.parse(project) as unknown;
      if (this.isEnvelope(parsed)) return parsed;
      return this.envelopeFromProject(parsed as Project);
    }
    if (this.isEnvelope(project)) return project;
    return this.envelopeFromProject(project);
  }

  private envelopeFromProject(project: Project): ProjectMobiEnvelopeV1 {
    const payload = ProjectSerializer.serialize(project);
    return {
      contract: "mobi.project-envelope",
      version: "1.0.0",
      schemaVersion: "1.0.0",
      projectId: project.id,
      mediaType: "application/vnd.mobi.project+json",
      payload,
      fingerprint: this.hash(payload),
    };
  }

  private openStudio(envelope: ProjectMobiEnvelopeV1, context: FlowExecutionContext): StudioApplication {
    const project = this.adapter.read(envelope) as Project;
    const app = this.dependencies.createStudio?.(project, context) ?? new StudioApplication(
      { read: () => structuredClone(project) },
      this.graphics(),
      this.events(),
      this.events(),
    );
    const viewport = context.viewport ?? { width: 1280, height: 720, pixelRatio: 1 };
    app.start({ ...viewport, pixelRatio: viewport.pixelRatio ?? 1 });
    return app;
  }

  private constructorContext(context: FlowExecutionContext, projectId: string): ConstructorPublicFlowContext {
    const coordinator: IndustrialTransactionCoordinatorPort = {
      execute: (command) => ({ success: true, transactionId: `flow:${command.operationName}:${command.entityId}` }),
    };
    return {
      sequence: context.constructorFlow?.sequence ?? 1,
      wasteFactor: context.constructorFlow?.wasteFactor ?? 0,
      sheet: context.constructorFlow?.sheet ?? { width: 1500, height: 1000, margin: 10, kerf: 4 },
      logs: context.constructorFlow?.logs ?? [],
      telemetry: context.constructorFlow?.telemetry ?? [],
      ruleRunner: context.constructorFlow?.ruleRunner ?? { analyze: () => [] },
      cognitiveGate: context.constructorFlow?.cognitiveGate ?? { analyze: () => ({ status: "HEALTHY", diagnostics: [] }) },
      cognitiveEvents: context.constructorFlow?.cognitiveEvents ?? { publish: () => {} },
      exportRegistrar: context.constructorFlow?.exportRegistrar ?? { register: () => ({ success: true, transactionId: `export:${projectId}` }) },
      traceRegistrar: context.constructorFlow?.traceRegistrar ?? { register: () => ({ success: true, transactionId: `trace:${projectId}` }) },
      transactionCoordinator: context.constructorFlow?.transactionCoordinator ?? coordinator,
    };
  }

  private graphics() {
    return {
      initialize: () => {},
      render: () => {},
      resize: () => {},
      dispose: () => {},
    };
  }

  private events() {
    return {
      subscribe: () => () => {},
    };
  }

  private toError(error: unknown): FlowExecutionError {
    const message = error instanceof Error ? error.message : String(error);
    const code = error instanceof Error && "code" in error && typeof error.code === "string"
      ? error.code
      : message || "FLOW_EXECUTION_FAILED";
    return {
      step: this.inferStep(`${code}:${message}`),
      code,
      message,
    };
  }

  private inferStep(message: string): FlowExecutionError["step"] {
    if (message.includes("SCHEMA") || message.includes("JSON") || message.includes("ENVELOPE")) return "VALIDATE_SCHEMA";
    if (message.includes("STUDIO")) return "OPEN_STUDIO";
    if (message.includes("CONSTRUCTOR")) return "RUN_CONSTRUCTOR";
    if (message.includes("SNAPSHOT")) return "GENERATE_SNAPSHOT";
    if (message.includes("VIEW")) return "DELIVER_MOBI_VIEW";
    return "LOAD_PROJECT";
  }

  private isEnvelope(value: unknown): value is ProjectMobiEnvelopeV1 {
    return Boolean(value && typeof value === "object" && (value as ProjectMobiEnvelopeV1).contract === "mobi.project-envelope");
  }

  private hash(raw: string): string {
    let hash = 2166136261;
    for (const char of raw) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }
}
