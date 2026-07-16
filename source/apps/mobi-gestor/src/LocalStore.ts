export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function newId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export class LocalStore<T> {
  constructor(
    private readonly key: string,
    private readonly storage: KeyValueStorage,
  ) {}

  list(): T[] {
    const raw = this.storage.getItem(this.key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  save(items: readonly T[]): void {
    this.storage.setItem(this.key, JSON.stringify(items));
  }
}
