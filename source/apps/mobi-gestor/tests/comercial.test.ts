import { describe, expect, it, beforeEach } from "vitest";
import { OrcamentoRepository } from "../src/OrcamentoRepository";
import { custoTotalOrcamento, precoVendaSugerido, valorLiquido, type NovoOrcamento } from "../src/GestorTypes";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function novoOrcamento(overrides: Partial<NovoOrcamento> = {}): NovoOrcamento {
  return {
    projetoId: "proj-1",
    valor: 12000,
    descontoPercentual: 0,
    margemPercentual: 30,
    comissaoPercentual: 4,
    custoMateriaPrima: null,
    custoMaoDeObra: null,
    custoFixoRateado: null,
    markupPercentual: null,
    ...overrides,
  };
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
      const criado = repo.add(novoOrcamento({ descontoPercentual: 5 }), 1000);
      expect(criado.status).toBe("ABERTO");
      expect(criado.motivoPerda).toBeNull();
    });

    it("finds the budget linked to a project", () => {
      const repo = new OrcamentoRepository(storage);
      repo.add(novoOrcamento(), 1000);
      expect(repo.porProjeto("proj-1")?.valor).toBe(12000);
      expect(repo.porProjeto("proj-inexistente")).toBeNull();
    });

    it("moves a budget to APROVADO and clears any loss reason", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add(novoOrcamento(), 1000);
      const atualizado = repo.atualizarStatus(criado.id, "APROVADO", 2000);
      expect(atualizado).toMatchObject({ status: "APROVADO", motivoPerda: null, atualizadoEm: 2000 });
    });

    it("moves a budget to PERDIDO and records the loss reason", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add(novoOrcamento(), 1000);
      const atualizado = repo.atualizarStatus(criado.id, "PERDIDO", 2000, "Cliente fechou com concorrente");
      expect(atualizado).toMatchObject({ status: "PERDIDO", motivoPerda: "Cliente fechou com concorrente" });
    });

    it("discards a stale loss reason if the budget re-opens", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add(novoOrcamento(), 1000);
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
      const primeiro = repo.add(novoOrcamento(), 1000);
      repo.atualizarStatus(primeiro.id, "PERDIDO", 2000, "Preço alto");

      const segundo = repo.add(novoOrcamento({ valor: 9000 }), 3000);

      const lista = repo.list();
      expect(lista).toHaveLength(2);
      expect(repo.porProjeto("proj-1")?.id).toBe(segundo.id);
    });

    it("stores the real-cost calculator fields when provided (CP003b)", () => {
      const repo = new OrcamentoRepository(storage);
      const criado = repo.add(
        novoOrcamento({ custoMateriaPrima: 390, custoMaoDeObra: 2588, custoFixoRateado: 120, markupPercentual: 35 }),
        1000,
      );
      expect(criado).toMatchObject({ custoMateriaPrima: 390, custoMaoDeObra: 2588, custoFixoRateado: 120, markupPercentual: 35 });
    });
  });

  describe("CP003b — calculadora de custo real", () => {
    it("sums raw material, labor, and allocated fixed cost", () => {
      const total = custoTotalOrcamento({ custoMateriaPrima: 390, custoMaoDeObra: 2588, custoFixoRateado: 120, markupPercentual: 0 });
      expect(total).toBe(3098);
    });

    it("applies markup on top of the total cost to suggest a sale price", () => {
      // Simplified markup-on-cost model - deliberately NOT a replica of the
      // real spreadsheet's more elaborate markup/despesas calculation
      // (documented as a known gap in ROADMAP.md).
      const sugestao = precoVendaSugerido({ custoMateriaPrima: 390, custoMaoDeObra: 2588, custoFixoRateado: 0, markupPercentual: 35 });
      expect(sugestao).toBeCloseTo(2978 * 1.35, 2);
    });

    it("suggests exactly the cost total when markup is zero", () => {
      const sugestao = precoVendaSugerido({ custoMateriaPrima: 100, custoMaoDeObra: 200, custoFixoRateado: 50, markupPercentual: 0 });
      expect(sugestao).toBe(350);
    });
  });
});
