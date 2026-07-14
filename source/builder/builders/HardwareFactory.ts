import type { Hardware } from "../types/ProjectTypes";

export class HardwareFactory {
  static create(input: Hardware): Hardware {
    return structuredClone(input);
  }
}
