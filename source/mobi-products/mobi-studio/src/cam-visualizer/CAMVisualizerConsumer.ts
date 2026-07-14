import type { NeutralCAMPackage } from "../industrial-integration/IndustrialContracts";
import type { CAMVisualizerState } from "./CAMVisualizerState";

export class CAMVisualizerConsumer {
  private sequence = 0;
  private state = this.emptyState();

  consume(cam: NeutralCAMPackage | null | undefined): CAMVisualizerState {
    this.sequence += 1;
    if (!cam) {
      this.state = this.emptyState();
      return this.snapshot();
    }
    this.state = Object.freeze({
      status: "READY",
      snapshotSequence: this.sequence,
      projectId: cam.projectId,
      version: cam.version,
      sourceContractVersion: cam.sourceContractVersion,
      layers: structuredClone(cam.layers),
      visibleLayers: structuredClone(cam.layers),
      paths: structuredClone(cam.paths),
      operations: structuredClone(cam.operations),
      bounds: structuredClone(cam.bounds),
      selectedOperationId: null,
    });
    return this.snapshot();
  }

  setLayerVisibility(layer: string, visible: boolean): CAMVisualizerState {
    if (!this.state.layers.includes(layer)) throw new Error("CAM_LAYER_NOT_FOUND");
    const visibleLayers = visible
      ? [...new Set([...this.state.visibleLayers, layer])]
      : this.state.visibleLayers.filter((candidate) => candidate !== layer);
    this.state = Object.freeze({ ...this.state, visibleLayers });
    return this.snapshot();
  }

  selectOperation(operationId: string | null): CAMVisualizerState {
    if (operationId && !this.state.operations.some((operation) => operation.id === operationId)) {
      throw new Error("CAM_OPERATION_NOT_FOUND");
    }
    this.state = Object.freeze({ ...this.state, selectedOperationId: operationId });
    return this.snapshot();
  }

  disconnect(): CAMVisualizerState {
    this.sequence += 1;
    this.state = this.emptyState();
    return this.snapshot();
  }

  snapshot(): CAMVisualizerState {
    return structuredClone(this.state);
  }

  private emptyState(): CAMVisualizerState {
    return Object.freeze({
      status: "NO_DATA",
      snapshotSequence: this.sequence,
      projectId: null,
      version: null,
      sourceContractVersion: null,
      layers: [],
      visibleLayers: [],
      paths: [],
      operations: [],
      bounds: null,
      selectedOperationId: null,
    });
  }
}
