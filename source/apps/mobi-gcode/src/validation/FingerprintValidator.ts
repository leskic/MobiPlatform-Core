import type { GCodeInput } from "../interfaces/GCodeTypes";
export class FingerprintValidator { validate(input: GCodeInput): boolean { return Boolean(input.camPackage.fingerprint.value) && input.camPackage.fingerprint.value === input.currentFingerprint && input.camPackage.toolpath.fingerprint.value === input.currentFingerprint; } }
