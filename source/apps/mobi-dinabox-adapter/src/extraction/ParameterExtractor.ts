export class ParameterExtractor { extract(input: Record<string, unknown> | undefined): Record<string, unknown> { return structuredClone(input ?? {}); } }
