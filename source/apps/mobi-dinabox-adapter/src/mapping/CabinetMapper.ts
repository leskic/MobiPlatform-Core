import type { CabinetFact, DinaboxModuleInput } from "../interfaces/DinaboxAdapterTypes";
export class CabinetMapper { map(modules: readonly DinaboxModuleInput[]): CabinetFact[] { return modules.flatMap(module => (module.cabinets ?? []).map(cabinet => ({ id: cabinet.id, moduleId: module.id, code: cabinet.code ?? null, parameters: structuredClone(cabinet.parameters ?? {}) }))); } }
