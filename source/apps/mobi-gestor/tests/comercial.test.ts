import { describe, expect, it, beforeEach } from "vitest";
import { OrcamentoRepository } from "../src/OrcamentoRepository";
import { valorLiquido } from "../src/GestorTypes";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe("Mobi Gestor CP002 comercial", () => {
  describe("valorLiquido", () => {
    it("applies the discount percentage to the raw value", () => {
      expect(valorLiquido({ valor: 10000, descontoPercentual: 10 })).toBe(9000);
    });

    it("returns the full value when there is no discount", () => {
      expect(valorLiquido({ valor: 5000, descontoPercentual: 0 })).toBe(5000);
    });
  });

  describe("OrcamentoRepository", () => {
    let storage: MemoryStorage;
    beforeEach(() => { storage = new MemoryStorage(); });

    it("creates a budget in ABERTO status with no loss reason", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add({ projetoId: "proj-1", valor: 12000, descontoPercentual: 5, margemPercentual: 30, comissaoPercentual: 4 }, 1000);
      expect(criado.status).toBe("ABERTO");
      expect(criado.motivoPerda).toBeNull();
    });

    it("finds the budget linked to a project", () => {
      const repo = new OrcamentoRepository(storage);
      repo.add({ projetoId: "proj-1", valor: 12000, descontoPercentual: 0, margemPercentual: 30, comissaoPercentual: 4 }, 1000);
      expect(repo.porProjeto("proj-1")?.valor).toBe(12000);
      expect(repo.porProjeto("proj-inexistente")).toBeNull();
    });

    it("moves a budget to APROVADO and clears any loss reason", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add({ projetoId: "proj-1", valor: 12000, descontoPercentual: 0, margemPercentual: 30, comissaoPercentual: 4 }, 1000);
      const atualizado = repo.atualizarStatus(criado.id, "APROVADO", 2000);
      expect(atualizado).toMatchObject({ status: "APROVADO", motivoPerda: null, atualizadoEm: 2000 });
    });

    it("moves a budget to PERDIDO and records the loss reason", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add({ projetoId: "proj-1", valor: 12000, descontoPercentual: 0, margemPercentual: 30, comissaoPercentual: 4 }, 1000);
      const atualizado = repo.atualizarStatus(criado.id, "PERDIDO", 2000, "Cliente fechou com concorrente");
      expect(atualizado).toMatchObject({ status: "PERDIDO", motivoPerda: "Cliente fechou com concorrente" });
    });

    it("discards a stale loss reason if the budget re-opens", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add({ projetoId: "proj-1", valor: 12000, descontoPercentual: 0, margemPercentual: 30, comissaoPercentual: 4 }, 1000);
      repo.atualizarStatus(criado.id, "PERDIDO", 2000, "Preço alto");
      const reaberto = repo.atualizarStatus(criado.id, "NEGOCIANDO", 3000);
      expect(reaberto?.motivoPerda).toBeNull();
    });

    it("allows a new budget to be created for a project whose previous budget was lost", () => {
      // Regression test: the UI used to permanently hide the "new budget" form
      // once ANY budget existed for a project, even a PERDIDO one, making it
      // impossible to re-quote a lost deal. The repository itself never
      // enforced one-budget-per-project; this confirms that still holds.
      const repo = new OrcamentoRepository(storage);
      const primeiro = repo.add({ projetoId: "proj-1", valor: 12000, descontoPercentual: 0, margemPercentual: 30, comissaoPercentual: 4 }, 1000);
      repo.atualizarStatus(primeiro.id, "PERDIDO", 2000, "Preço alto");

      const segundo = repo.add({ projetoId: "proj-1", valor: 9000, descontoPercentual: 0, margemPercentual: 30, comissaoPercentual: 4 }, 3000);

      const lista = repo.list();
      expect(lista).toHaveLength(2);
      expect(repo.porProjeto("proj-1")?.id).toBe(segundo.id);
    });
  });
});
