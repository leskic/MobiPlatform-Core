import { describe, expect, it, beforeEach } from "vitest";
import { ItemEstoqueRepository } from "../src/ItemEstoqueRepository";
import { computeAtencao } from "../src/AtencaoEngine";
import type { NovoItemEstoque, Projeto } from "../src/GestorTypes";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function novoItemEstoque(overrides: Partial<NovoItemEstoque> = {}): NovoItemEstoque {
  return {
    nome: "Dobradiça 35mm",
    unidade: "un",
    quantidadeMinima: 20,
    ...overrides,
  };
}

describe("Mobi Gestor CP006 compras e estoque", () => {
  let storage: MemoryStorage;
  beforeEach(() => {
    storage = new MemoryStorage();
  });

  describe("ItemEstoqueRepository", () => {
    it("creates an item starting at zero quantity", () => {
      const repo = new ItemEstoqueRepository(storage);
      const criado = repo.add(novoItemEstoque(), 1000);
      expect(criado.quantidadeAtual).toBe(0);
      expect(criado.quantidadeMinima).toBe(20);
    });

    it("lists items sorted by name", () => {
      const repo = new ItemEstoqueRepository(storage);
      repo.add(novoItemEstoque({ nome: "Parafuso" }), 1000);
      repo.add(novoItemEstoque({ nome: "Dobradiça" }), 1000);
      expect(repo.list().map((item) => item.nome)).toEqual(["Dobradiça", "Parafuso"]);
    });

    it("adds quantity on ENTRADA and records the movement", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      const resultado = repo.registrarMovimento(item.id, "ENTRADA", 50, null, "Compra inicial", 2000);
      expect(resultado?.item.quantidadeAtual).toBe(50);
      expect(resultado?.movimento.tipo).toBe("ENTRADA");
      expect(resultado?.movimento.quantidade).toBe(50);
    });

    it("subtracts quantity on a valid SAIDA", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      repo.registrarMovimento(item.id, "ENTRADA", 50, null, "Compra", 2000);
      const resultado = repo.registrarMovimento(item.id, "SAIDA", 30, "proj-1", "Uso na obra", 3000);
      expect(resultado?.item.quantidadeAtual).toBe(20);
      expect(resultado?.movimento.projetoId).toBe("proj-1");
    });

    it("rejects a SAIDA that would leave quantity negative, changing nothing", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      repo.registrarMovimento(item.id, "ENTRADA", 10, null, "Compra", 2000);
      const resultado = repo.registrarMovimento(item.id, "SAIDA", 11, null, "Uso na obra", 3000);
      expect(resultado).toBeNull();
      expect(repo.list()[0]?.quantidadeAtual).toBe(10);
      expect(repo.listMovimentosPorItem(item.id)).toHaveLength(1);
    });

    it("rejects a movement with zero or negative quantidade", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      expect(repo.registrarMovimento(item.id, "ENTRADA", 0, null, "Nada", 2000)).toBeNull();
      expect(repo.registrarMovimento(item.id, "ENTRADA", -5, null, "Nada", 2000)).toBeNull();
    });

    it("lists movements for a specific item only", () => {
      const repo = new ItemEstoqueRepository(storage);
      const itemA = repo.add(novoItemEstoque({ nome: "A" }), 1000);
      const itemB = repo.add(novoItemEstoque({ nome: "B" }), 1000);
      repo.registrarMovimento(itemA.id, "ENTRADA", 10, null, "Compra A", 2000);
      repo.registrarMovimento(itemB.id, "ENTRADA", 5, null, "Compra B", 2000);
      expect(repo.listMovimentosPorItem(itemA.id)).toHaveLength(1);
      expect(repo.listMovimentosPorItem(itemA.id)[0]?.itemEstoqueId).toBe(itemA.id);
    });
  });

  describe("computeAtencao com estoque (CP006)", () => {
    it("stays backward compatible when itensEstoque is omitted", () => {
      expect(computeAtencao([], 1000)).toEqual([]);
    });

    it("flags a stock item below its minimum", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque({ nome: "Cola branca", unidade: "litro", quantidadeMinima: 10 }), 1000);
      repo.registrarMovimento(item.id, "ENTRADA", 3, null, "Compra pequena", 2000);

      const itens = computeAtencao([] as Projeto[], 3000, repo.list());
      expect(itens).toEqual([
        {
          projetoId: item.id,
          projetoNome: "Cola branca",
          motivo: "Estoque abaixo do mínimo (3 de 10 litro)",
          severidade: "warning",
        },
      ]);
    });

    it("does not flag a stock item at or above its minimum", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque({ quantidadeMinima: 10 }), 1000);
      repo.registrarMovimento(item.id, "ENTRADA", 10, null, "Compra", 2000);
      expect(computeAtencao([] as Projeto[], 3000, repo.list())).toEqual([]);
    });
  });
});
