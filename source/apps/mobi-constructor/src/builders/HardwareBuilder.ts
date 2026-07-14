import { HardwareFactory } from "../../../../builder/builders/HardwareFactory"; import type { Hardware } from "../../../../builder/types/ProjectTypes";
export class HardwareBuilder { build(input: Hardware): Hardware { return HardwareFactory.create(structuredClone(input)); } }
