import type { Project } from "../../../../builder/types/ProjectTypes"; export class MobiProjectMapper { map(input: Project): Project { return structuredClone(input); } }
