import type { ConstructorPublicFlowContext } from "../../../mobi-products/mobi-constructor/src/index";
import type { Project } from "../../../builder/types/ProjectTypes";
import type { ProjectMobiEnvelopeV1 } from "../../mobi-platform-chain-v1/src/index";

export type FlowProjectInput = string | Project | ProjectMobiEnvelopeV1;

export interface FlowViewport {
  readonly width: number;
  readonly height: number;
  readonly pixelRatio?: number;
}

export interface FlowExecutionContext {
  readonly project: FlowProjectInput;
  readonly sessionId?: string;
  readonly viewport?: FlowViewport;
  readonly constructorFlow?: Partial<ConstructorPublicFlowContext>;
}
