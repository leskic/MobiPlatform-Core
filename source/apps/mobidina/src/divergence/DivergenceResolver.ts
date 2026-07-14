import type { ClassifiedDivergence } from "../interfaces/MobiDinaTypes";
export class DivergenceResolver { requiresConfirmation(divergence: ClassifiedDivergence): true { void divergence; return true; } resolve(): never { throw new Error("MobiDina never resolves divergences automatically"); } }
