import { MeshBasicMaterial, MeshStandardMaterial, type Material, type Mesh } from "three";
import type { ViewSnapshot } from "../presentation/interfaces/PresentationTypes";

export class MaterialManager {
  private readonly standard = new MeshStandardMaterial({ color: 0xb8b8b8 });
  private readonly inspection = new MeshBasicMaterial({ color: 0x90caf9 });
  private readonly production = new MeshBasicMaterial({ color: 0xffcc80 });
  private readonly wireframe = new MeshBasicMaterial({ color: 0x333333, wireframe: true });

  resolve(view: ViewSnapshot): Material {
    if (view.wireframe) return this.wireframe;
    if (!view.materials) return view.mode === "production" ? this.production : this.inspection;
    return this.standard;
  }

  apply(mesh: Mesh, view: ViewSnapshot): void {
    const source = this.resolve(view);
    const existing = mesh.userData.viewerMaterial as Material | undefined;
    if (existing && existing.type !== source.type) existing.dispose();
    const material = existing?.type === source.type ? existing : source.clone();
    material.copy(source); mesh.userData.viewerMaterial = material; mesh.material = material;
    mesh.castShadow = view.shadows;
    mesh.receiveShadow = view.shadows;
    mesh.frustumCulled = true;
  }

  dispose(): void { this.standard.dispose(); this.inspection.dispose(); this.production.dispose(); this.wireframe.dispose(); }
}
