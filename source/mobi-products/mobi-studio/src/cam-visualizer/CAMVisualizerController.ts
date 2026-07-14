import type {
  CAMBounds,
  NeutralCAMOperation,
  NeutralCAMPackage,
} from "../industrial-integration/IndustrialContracts";
import { CAMSelectionBridge, type CAMSelectionResult } from "./CAMSelectionBridge";
import { CAMVisualizerConsumer } from "./CAMVisualizerConsumer";
import type { CAMVisualizerState } from "./CAMVisualizerState";
import type {
  CAMVisualizerRenderer,
  CAMVisualizerViewModel,
} from "./CAMVisualizerViewModel";

export class CAMVisualizerController {
  constructor(
    private readonly consumer = new CAMVisualizerConsumer(),
    private readonly selection?: CAMSelectionBridge,
    private readonly renderer?: CAMVisualizerRenderer,
  ) {}

  connect(cam: NeutralCAMPackage | null | undefined): CAMVisualizerViewModel {
    return this.present(this.consumer.consume(cam));
  }

  update(cam: NeutralCAMPackage | null | undefined): CAMVisualizerViewModel {
    return this.present(this.consumer.consume(cam));
  }

  setLayerVisibility(layer: string, visible: boolean): CAMVisualizerViewModel {
    return this.present(this.consumer.setLayerVisibility(layer, visible));
  }

  inspectOperation(operationId: string): NeutralCAMOperation | null {
    return this.consumer.snapshot().operations.find((operation) => operation.id === operationId) ?? null;
  }

  selectOperation(operationId: string): CAMSelectionResult {
    const operation = this.inspectOperation(operationId);
    if (!operation || !this.selection) return { success: false, code: "CAM_ENTITY_NOT_VISIBLE" };
    const result = this.selection.select(operation);
    if (result.success) this.consumer.selectOperation(operationId);
    return result;
  }

  focusBounds(operationId?: string): CAMBounds | null {
    const state = this.consumer.snapshot();
    if (!operationId) return state.bounds;
    const operation = state.operations.find((candidate) => candidate.id === operationId);
    return state.paths.find((path) => path.id === operation?.pathId)?.bounds ?? null;
  }

  disconnect(): CAMVisualizerViewModel {
    this.selection?.clear();
    return this.present(this.consumer.disconnect());
  }

  render(): CAMVisualizerViewModel {
    return this.present(this.consumer.snapshot());
  }

  getState(): CAMVisualizerState {
    return this.consumer.snapshot();
  }

  private present(state: CAMVisualizerState): CAMVisualizerViewModel {
    const visible = new Set(state.visibleLayers);
    const paths = state.paths.filter((path) => visible.has(path.layer));
    const pathIds = new Set(paths.map((path) => path.id));
    const viewModel: CAMVisualizerViewModel = Object.freeze({
      component: "CAM_VISUALIZER",
      hasData: state.status === "READY",
      projectId: state.projectId,
      version: state.version,
      sourceContractVersion: state.sourceContractVersion,
      layers: state.layers.map((id) => ({ id, visible: visible.has(id) })),
      paths,
      operations: state.operations.filter((operation) => pathIds.has(operation.pathId)),
      bounds: structuredClone(state.bounds),
      selectedOperation: state.operations.find((operation) => operation.id === state.selectedOperationId) ?? null,
    });
    this.renderer?.render(viewModel);
    return viewModel;
  }
}
