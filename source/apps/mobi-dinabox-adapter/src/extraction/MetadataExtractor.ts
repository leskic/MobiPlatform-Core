export class MetadataExtractor { extract(input: Record<string, unknown> | undefined): Record<string, unknown> { return structuredClone(input ?? {}); } }
