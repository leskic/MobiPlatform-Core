import type { DinaboxMaterialInput, MaterialFact } from "../interfaces/DinaboxAdapterTypes";
export class MaterialMapper { map(input: readonly DinaboxMaterialInput[]): MaterialFact[] { return input.map(item => ({ id: item.id, code: item.code ?? null, thickness: item.thickness ?? null })); } }
