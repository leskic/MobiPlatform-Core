export class MetadataMapper { map(metadata: Record<string, unknown>, attributes: Record<string, unknown>): Record<string, unknown> { return structuredClone({ ...attributes, ...metadata }); } }
