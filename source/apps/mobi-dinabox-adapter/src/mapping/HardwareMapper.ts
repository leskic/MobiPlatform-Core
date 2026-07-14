import type { DinaboxHardwareInput, HardwareFact } from "../interfaces/DinaboxAdapterTypes";
export class HardwareMapper { map(input: readonly DinaboxHardwareInput[]): HardwareFact[] { return input.map(item => ({ id: item.id, catalogId: item.catalogId ?? null, hostId: item.hostId ?? null, parameters: structuredClone(item.parameters ?? {}) })); } }
