export class RevisionMonitor { changed(current: string, expected: string): boolean { return current !== expected; } }
