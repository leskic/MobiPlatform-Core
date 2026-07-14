import { Box3, OrthographicCamera, PerspectiveCamera, Vector3, type Camera, type Object3D } from "three";
import type { CameraSnapshot, Vector3State } from "../presentation/interfaces/PresentationTypes";
import type { CameraProposal } from "./interfaces/ViewerTypes";

const vector = (value: Vector3State): Vector3 => new Vector3(value.x, value.y, value.z);
const state = (value: Vector3): Vector3State => ({ x: value.x, y: value.y, z: value.z });

export class CameraController {
  private readonly perspective = new PerspectiveCamera(50, 1, 0.1, 1_000_000);
  private readonly orthographic = new OrthographicCamera(-500, 500, 500, -500, 0.1, 1_000_000);
  private active: Camera = this.perspective;

  sync(snapshot: CameraSnapshot, aspect = 1): Camera {
    this.active = snapshot.projection === "perspective" ? this.perspective : this.orthographic;
    this.active.position.copy(vector(snapshot.position)); this.active.lookAt(vector(snapshot.target));
    if (this.active instanceof PerspectiveCamera) { this.active.aspect = aspect; this.active.zoom = snapshot.zoom; this.active.updateProjectionMatrix(); }
    else { const camera = this.active as OrthographicCamera; camera.left = -500 * aspect; camera.right = 500 * aspect; camera.zoom = snapshot.zoom; camera.updateProjectionMatrix(); }
    return this.active;
  }

  getCamera(): Camera { return this.active; }
  orbit(current: CameraSnapshot, azimuth: number, polar: number): CameraProposal {
    const target = vector(current.target); const offset = vector(current.position).sub(target);
    const radius = Math.max(offset.length(), 0.0001); const sphericalPolar = Math.acos(Math.min(1, Math.max(-1, offset.y / radius)));
    const theta = Math.atan2(offset.x, offset.z) + azimuth; const phi = Math.min(Math.PI - 0.0001, Math.max(0.0001, sphericalPolar + polar));
    offset.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta));
    return { position: state(target.clone().add(offset)), target: current.target, zoom: current.zoom, projection: current.projection };
  }
  pan(current: CameraSnapshot, x: number, y: number): CameraProposal {
    const delta = new Vector3(x, y, 0); return { position: state(vector(current.position).add(delta)), target: state(vector(current.target).add(delta)), zoom: current.zoom, projection: current.projection };
  }
  zoom(current: CameraSnapshot, factor: number): CameraProposal {
    if (factor <= 0) throw new Error("Camera zoom factor must be positive");
    return { position: current.position, target: current.target, zoom: current.zoom * factor, projection: current.projection };
  }
  frame(current: CameraSnapshot, objects: readonly Object3D[]): CameraProposal {
    const box = new Box3(); for (const object of objects) if (object.visible) box.expandByObject(object);
    if (box.isEmpty()) return { position: current.position, target: current.target, zoom: current.zoom, projection: current.projection };
    const center = box.getCenter(new Vector3()); const size = box.getSize(new Vector3()); const distance = Math.max(size.x, size.y, size.z, 1) * 1.5;
    return { position: state(center.clone().add(new Vector3(distance, distance, distance))), target: state(center), zoom: current.zoom, projection: current.projection };
  }
}
