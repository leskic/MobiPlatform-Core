export class ConstructorError extends Error { constructor(readonly code: string, message: string) { super(message); this.name = "ConstructorError"; } }
