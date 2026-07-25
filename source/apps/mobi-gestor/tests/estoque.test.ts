import { describe, expect, it, beforeEach } from "vitest";
import { ItemEstoqueRepository, type DadosMovimento } from "../src/ItemEstoqueRepository";
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

function entrada(itemEstoqueId: string, overrides: Partial<DadosMovimento> = {}): DadosMovimento {
  return {
    itemEstoqueId,
    tipo: "ENTRADA",
    quantidade: 50,
    projetoId: null,
    fornecedor: "Fornecedor Padrão Ltda",
    precoUnitario: 2.5,
    motivo: "Compra",
    ...overrides,
  };
}

function saida(itemEstoqueId: string, overrides: Partial<DadosMovimento> = {}): DadosMovimento {
  return {
    itemEstoqueId,
    tipo: "SAIDA",
    quantidade: 10,
    projetoId: "proj-1",
    fornecedor: null,
    precoUnitario: null,
    motivo: "Uso na obra",
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

    it("adds quantity on ENTRADA and records fornecedor/preco", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      const resultado = repo.registrarMovimento(entrada(item.id, { quantidade: 50 }), 2000);
      expect(resultado?.item.quantidadeAtual).toBe(50);
      expect(resultado?.movimento.tipo).toBe("ENTRADA");
      expect(resultado?.movimento.fornecedor).toBe("Fornecedor Padrão Ltda");
      expect(resultado?.movimento.precoUnitario).toBe(2.5);
    });

    it("rejects an ENTRADA without fornecedor", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      expect(repo.registrarMovimento(entrada(item.id, { fornecedor: null }), 2000)).toBeNull();
      expect(repo.list()[0]?.quantidadeAtual).toBe(0);
    });

    it("rejects an ENTRADA without a positive precoUnitario", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      expect(repo.registrarMovimento(entrada(item.id, { precoUnitario: null }), 2000)).toBeNull();
      expect(repo.registrarMovimento(entrada(item.id, { precoUnitario: 0 }), 2000)).toBeNull();
      expect(repo.list()[0]?.quantidadeAtual).toBe(0);
    });

    it("subtracts quantity on a valid SAIDA linked to a project", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      repo.registrarMovimento(entrada(item.id, { quantidade: 50 }), 2000);
      const resultado = repo.registrarMovimento(saida(item.id, { quantidade: 30, projetoId: "proj-1" }), 3000);
      expect(resultado?.item.quantidadeAtual).toBe(20);
      expect(resultado?.movimento.projetoId).toBe("proj-1");
      expect(resultado?.movimento.fornecedor).toBeNull();
      expect(resultado?.movimento.precoUnitario).toBeNull();
    });

    it("rejects a SAIDA without a projetoId", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      repo.registrarMovimento(entrada(item.id, { quantidade: 50 }), 2000);
      const resultado = repo.registrarMovimento(saida(item.id, { projetoId: null }), 3000);
      expect(resultado).toBeNull();
      expect(repo.list()[0]?.quantidadeAtual).toBe(50);
    });

    it("rejects a SAIDA that would leave quantity negative, changing nothing", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      repo.registrarMovimento(entrada(item.id, { quantidade: 10 }), 2000);
      const resultado = repo.registrarMovimento(saida(item.id, { quantidade: 11 }), 3000);
      expect(resultado).toBeNull();
      expect(repo.list()[0]?.quantidadeAtual).toBe(10);
      expect(repo.listMovimentosPorItem(item.id)).toHaveLength(1);
    });

    it("rejects a movement with zero or negative quantidade", () => {
      const repo = new ItemEstoqueRepository(storage);
      const item = repo.add(novoItemEstoque(), 1000);
      expect(repo.registrarMovimento(entrada(item.id, { quantidade: 0 }), 2000)).toBeNull();
      expect(repo.registrarMovimento(entrada(item.id, { quantidade: -5 }), 2000)).toBeNull();
    });

    it("lists movements for a specific item only", () => {
      const repo = new ItemEstoqueRepository(storage);
      const itemA = repo.add(novoItemEstoque({ nome: "A" }), 1000);
      const itemB = repo.add(novoItemEstoque({ nome: "B" }), 1000);
      repo.registrarMovimento(entrada(itemA.id, { quantidade: 10 }), 2000);
      repo.registrarMovimento(entrada(itemB.id, { quantidade: 5 }), 2000);
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
      repo.registrarMovimento(entrada(item.id, { quantidade: 3 }), 2000);

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
      repo.registrarMovimento(entrada(item.id, { quantidade: 10 }), 2000);
      expect(computeAtencao([] as Projeto[], 3000, repo.list())).toEqual([]);
    });
  });
});
