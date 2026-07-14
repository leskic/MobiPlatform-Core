import type { GCodePackageSnapshot } from "./interfaces/GCodeTypes";
export class GCodeRepository { private value: GCodePackageSnapshot | null = null; save(value: GCodePackageSnapshot): void { this.value = structuredClone(value); } get(): GCodePackageSnapshot | null { return structuredClone(this.value); } clear(): void { this.value = null; } }
