import type { ConstructorResultSnapshot } from "./interfaces/ConstructorTypes";
export class ConstructorRepository { private result: ConstructorResultSnapshot | null = null; save(result: ConstructorResultSnapshot): void { this.result = structuredClone(result); } clear(): void { this.result = null; } get(): ConstructorResultSnapshot | null { return structuredClone(this.result); } }
