import type { ConstructorContext } from "../ConstructorContext"; import type { DomainMapper } from "../mapping/DomainMapper";
export class BuildStage { constructor(private readonly mapper: DomainMapper) {} execute(context: ConstructorContext): void { if (!context.mapped) throw new Error("Construction input has not been mapped"); context.project = this.mapper.build(context.mapped); } }
