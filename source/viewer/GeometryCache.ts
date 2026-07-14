import type { BufferGeometry } from "three";

export class GeometryCache {
  private readonly values = new Map<string, BufferGeometry>();

  set(key: string, geometry: BufferGeometry): void {
    const previous = this.values.get(key);
    if (previous && previous !== geometry) previous.dispose();
    this.values.set(key, geometry);
  }

  get(key: string): BufferGeometry | undefined { return this.values.get(key); }
  has(key: string): boolean { return this.values.has(key); }

  delete(key: string): boolean {
    const geometry = this.values.get(key);
    if (!geometry) return false;
    geometry.dispose();
    return this.values.delete(key);
  }

  clear(): void {
    for (const geometry of this.values.values()) geometry.dispose();
    this.values.clear();
  }

  get size(): number { return this.values.size; }
}
