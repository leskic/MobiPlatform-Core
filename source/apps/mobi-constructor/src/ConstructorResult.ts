import type { ConstructorResultSnapshot } from "./interfaces/ConstructorTypes";
export class ConstructorResult { constructor(private readonly value: ConstructorResultSnapshot) {} get(): ConstructorResultSnapshot { return structuredClone(this.value); } }
