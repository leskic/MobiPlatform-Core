import type { GCodeFile, GCodeMachineProfile, GCodePackageSnapshot } from "../interfaces/GCodeTypes";
export class GCodePackage { build(file: GCodeFile, profile: GCodeMachineProfile): GCodePackageSnapshot { return { projectId: file.projectId, fingerprint: file.fingerprint, machineProfile: structuredClone(profile), files: [structuredClone(file)] }; } }
