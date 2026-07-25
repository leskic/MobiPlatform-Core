import { describe, expect, it } from "vitest";
import { computeFluxoCaixa, custoTotalReal, formatarPeriodo, valorTotalVendido } from "../src/FinanceiroEngine";
import type { MovimentoEstoque, NovoOrcamento, Orcamento } from "../src/GestorTypes";

function orcamento(overrides: Partial<Orcamento> = {}): Orcamento {
  const base: NovoOrcamento = {
    projetoId: "proj-1",
    valor: 10000,
    descontoPercentual: 0,
    margemPercentual: 30,
    comissaoPercentual: 4,
    custoMateriaPrima: null,
    custoMaoDeObra: null,
    custoFixoRateado: null,
    markupPercentual: null,
  };
  return {
    ...base,
    id: "orc-1",
    status: "APROVADO",
    motivoPerda: null,
    custoRealTotal: null,
    fechadoEm: null,
    criadoEm: 1000,
    atualizadoEm: 1000,
    ...overrides,
  };
}

function movimentoEntrada(overrides: Partial<MovimentoEstoque> = {}): MovimentoEstoque {
  return {
    id: "mov-1",
    itemEstoqueId: "est-1",
    tipo: "ENTRADA",
    quantidade: 10,
    projetoId: null,
    fornecedor: "Fornecedor X",
    precoUnitario: 5,
    motivo: "Compra",
    criadoEm: 1000,
    ...overrides,
  };
}

const JAN_2026 = new Date(2026, 0, 15).getTime();
const FEV_2026 = new Date(2026, 1, 10).getTime();

describe("Mobi Gestor CP007 financeiro", () => {
  describe("valorTotalVendido", () => {
    it("only counts closed (fechadoEm != null) budgets", () => {
      const fechado = orcamento({ id: "orc-1", valor: 10000, fechadoEm: JAN_2026 });
      const aberto = orcamento({ id: "orc-2", valor: 5000, fechadoEm: null });
      expect(valorTotalVendido([fechado, aberto])).toBe(10000);
    });

    it("applies the discount via valorLiquido", () => {
      const fechado = orcamento({ valor: 10000, descontoPercentual: 10, fechadoEm: JAN_2026 });
      expect(valorTotalVendido([fechado])).toBe(9000);
    });

    it("returns zero when there are no closed budgets", () => {
      expect(valorTotalVendido([orcamento({ fechadoEm: null })])).toBe(0);
    });
  });

  describe("custoTotalReal", () => {
    it("only counts custoRealTotal from closed budgets", () => {
      const fechado = orcamento({ custoRealTotal: 4000, fechadoEm: JAN_2026 });
      const aberto = orcamento({ custoRealTotal: null, fechadoEm: null });
      expect(custoTotalReal([fechado, aberto])).toBe(4000);
    });

    it("treats a missing custoRealTotal on a closed budget as zero", () => {
      const fechadoSemCusto = orcamento({ custoRealTotal: null, fechadoEm: JAN_2026 });
      expect(custoTotalReal([fechadoSemCusto])).toBe(0);
    });
  });

  describe("computeFluxoCaixa", () => {
    it("puts a closed budget's valorLiquido as entrada in its fechadoEm month", () => {
      const fechado = orcamento({ valor: 10000, fechadoEm: JAN_2026 });
      const pontos = computeFluxoCaixa([fechado], []);
      expect(pontos).toEqual([{ periodo: "2026-01", entradas: 10000, saidas: 0, saldo: 10000 }]);
    });

    it("puts an ENTRADA movement's cost as saida in its criadoEm month", () => {
      const movimento = movimentoEntrada({ quantidade: 10, precoUnitario: 5, criadoEm: JAN_2026 });
      const pontos = computeFluxoCaixa([], [movimento]);
      expect(pontos).toEqual([{ periodo: "2026-01", entradas: 0, saidas: 50, saldo: -50 }]);
    });

    it("ignores SAIDA movements (they are not a cash outflow of purchase)", () => {
      const saida = movimentoEntrada({ tipo: "SAIDA", precoUnitario: null, projetoId: "proj-1", criadoEm: JAN_2026 });
      expect(computeFluxoCaixa([], [saida])).toEqual([]);
    });

    it("merges entrada and saida in the same month into one point", () => {
      const fechado = orcamento({ valor: 10000, fechadoEm: JAN_2026 });
      const movimento = movimentoEntrada({ quantidade: 10, precoUnitario: 5, criadoEm: JAN_2026 });
      expect(computeFluxoCaixa([fechado], [movimento])).toEqual([
        { periodo: "2026-01", entradas: 10000, saidas: 50, saldo: 9950 },
      ]);
    });

    it("returns separate points sorted chronologically across months", () => {
      const fechadoFev = orcamento({ id: "orc-fev", valor: 3000, fechadoEm: FEV_2026 });
      const fechadoJan = orcamento({ id: "orc-jan", valor: 5000, fechadoEm: JAN_2026 });
      const pontos = computeFluxoCaixa([fechadoFev, fechadoJan], []);
      expect(pontos.map((p) => p.periodo)).toEqual(["2026-01", "2026-02"]);
      expect(pontos[0]?.entradas).toBe(5000);
      expect(pontos[1]?.entradas).toBe(3000);
    });

    it("returns an empty list when there is nothing closed or purchased", () => {
      expect(computeFluxoCaixa([orcamento({ fechadoEm: null })], [])).toEqual([]);
    });
  });

  describe("formatarPeriodo", () => {
    it("formats YYYY-MM as MonPt/YYYY", () => {
      expect(formatarPeriodo("2026-01")).toBe("Jan/2026");
      expect(formatarPeriodo("2026-07")).toBe("Jul/2026");
      expect(formatarPeriodo("2026-12")).toBe("Dez/2026");
    });
  });
});
