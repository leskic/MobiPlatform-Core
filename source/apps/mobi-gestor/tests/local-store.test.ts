import { describe, expect, it, beforeEach } from "vitest";
import { LocalStore } from "../src/LocalStore";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

interface Item {
  id: string;
  valor: number;
}

describe("LocalStore", () => {
  let storage: MemoryStorage;
  let store: LocalStore<Item>;

  beforeEach(() => {
    storage = new MemoryStorage();
    store = new LocalStore<Item>("test-key", storage);
  });

  it("starts empty when there is nothing in storage", () => {
    expect(store.list()).toEqual([]);
  });

  it("append adds an item without needing to read-then-save manually", () => {
    store.append({ id: "a", valor: 1 });
    store.append({ id: "b", valor: 2 });
    expect(store.list()).toEqual([{ id: "a", valor: 1 }, { id: "b", valor: 2 }]);
  });

  it("update replaces the first item matching the predicate", () => {
    store.append({ id: "a", valor: 1 });
    store.append({ id: "b", valor: 2 });
    const atualizado = store.update((item) => item.id === "b", (item) => ({ ...item, valor: 99 }));
    expect(atualizado).toEqual({ id: "b", valor: 99 });
    expect(store.list()).toEqual([{ id: "a", valor: 1 }, { id: "b", valor: 99 }]);
  });

  it("update returns null and does not touch storage when nothing matches", () => {
    store.append({ id: "a", valor: 1 });
    const resultado = store.update((item) => item.id === "nao-existe", (item) => item);
    expect(resultado).toBeNull();
    expect(store.list()).toEqual([{ id: "a", valor: 1 }]);
  });

  it("recovers gracefully from corrupted JSON in storage", () => {
    storage.setItem("test-key", "{ not valid json");
    expect(store.list()).toEqual([]);
  });

  it("ignores a stored value that parses but is not an array", () => {
    storage.setItem("test-key", JSON.stringify({ not: "an array" }));
    expect(store.list()).toEqual([]);
  });
});
