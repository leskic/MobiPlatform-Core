import { describe, expect, it } from "vitest";
import { etapasAtrasadas, rankingResponsaveis, tempoMedioFechamentoDias } from "../src/IndicadoresEngine";
import type { NovoProjeto, Orcamento, Projeto } from "../src/GestorTypes";

let contador = 0;
function projeto(overrides: Partial<Projeto> = {}): Projeto {
  contador += 1;
  const base: NovoProjeto = {
    clienteId: "cli-1",
    nome: `Projeto ${contador}`,
    status: "NOVO",
    prioridade: "MEDIA",
    responsavel: "Charles",
  };
  return {
    ...base,
    id: `proj-${contador}`,
    etapaProducao: null,
    criadoEm: 1000,
    atualizadoEm: 1000,
    ...overrides,
  };
}

function orcamento(overrides: Partial<Orcamento> = {}): Orcamento {
  return {
    id: "orc-1",
    projetoId: "proj-1",
    valor: 10000,
    descontoPercentual: 0,
    margemPercentual: 0,
    comissaoPercentual: 0,
    custoMateriaPrima: null,
    custoMaoDeObra: null,
    custoFixoRateado: null,
    markupPercentual: null,
    status: "APROVADO",
    motivoPerda: null,
    custoRealTotal: null,
    fechadoEm: null,
    criadoEm: 1000,
    atualizadoEm: 1000,
    ...overrides,
  };
}

const UM_DIA_MS = 24 * 60 * 60 * 1000;

describe("Mobi Gestor CP008 indicadores", () => {
  describe("etapasAtrasadas", () => {
    it("counts a stalled PRODUCAO project under its etapa", () => {
      const agora = 10 * UM_DIA_MS;
      const p = projeto({ status: "PRODUCAO", etapaProducao: "CORTE", atualizadoEm: 0 });
      const resultado = etapasAtrasadas([p], agora);
      expect(resultado.find((e) => e.etapa === "CORTE")?.quantidadeParada).toBe(1);
    });

    it("always returns all 5 etapas, zero where nothing is stalled", () => {
      const resultado = etapasAtrasadas([], 1000);
      expect(resultado.map((e) => e.etapa)).toEqual(["FILA", "CORTE", "MONTAGEM_ESTRUTURA", "ACABAMENTO", "ENTREGA"]);
      expect(resultado.every((e) => e.quantidadeParada === 0)).toBe(true);
    });

    it("does not count projects outside PRODUCAO even if old", () => {
      const agora = 10 * UM_DIA_MS;
      const p = projeto({ status: "NOVO", etapaProducao: null, atualizadoEm: 0 });
      const resultado = etapasAtrasadas([p], agora);
      expect(resultado.every((e) => e.quantidadeParada === 0)).toBe(true);
    });

    it("does not count a PRODUCAO project updated recently", () => {
      const agora = 2 * UM_DIA_MS;
      const p = projeto({ status: "PRODUCAO", etapaProducao: "CORTE", atualizadoEm: agora });
      const resultado = etapasAtrasadas([p], agora);
      expect(resultado.find((e) => e.etapa === "CORTE")?.quantidadeParada).toBe(0);
    });
  });

  describe("rankingResponsaveis", () => {
    it("counts only CONCLUIDO projects, grouped by responsavel", () => {
      const lista = [
        projeto({ responsavel: "Ana", status: "CONCLUIDO" }),
        projeto({ responsavel: "Ana", status: "CONCLUIDO" }),
        projeto({ responsavel: "Bruno", status: "CONCLUIDO" }),
        projeto({ responsavel: "Ana", status: "NOVO" }),
      ];
      expect(rankingResponsaveis(lista)).toEqual([
        { responsavel: "Ana", concluidos: 2 },
        { responsavel: "Bruno", concluidos: 1 },
      ]);
    });

    it("returns an empty list when nobody has finished a project", () => {
      expect(rankingResponsaveis([projeto({ status: "NOVO" })])).toEqual([]);
    });
  });

  describe("tempoMedioFechamentoDias", () => {
    it("computes the average number of days from criadoEm to fechadoEm", () => {
      const p1 = projeto({ id: "proj-1", criadoEm: 0 });
      const p2 = projeto({ id: "proj-2", criadoEm: 0 });
      const o1 = orcamento({ projetoId: "proj-1", fechadoEm: 10 * UM_DIA_MS });
      const o2 = orcamento({ projetoId: "proj-2", fechadoEm: 20 * UM_DIA_MS });
      expect(tempoMedioFechamentoDias([o1, o2], [p1, p2])).toBe(15);
    });

    it("returns null when there are no closed budgets", () => {
      expect(tempoMedioFechamentoDias([orcamento({ fechadoEm: null })], [projeto()])).toBeNull();
    });

    it("ignores a closed budget whose project no longer exists", () => {
      const p1 = projeto({ id: "proj-1", criadoEm: 0 });
      const o1 = orcamento({ projetoId: "proj-1", fechadoEm: 10 * UM_DIA_MS });
      const oOrfao = orcamento({ projetoId: "proj-inexistente", fechadoEm: 999 * UM_DIA_MS });
      expect(tempoMedioFechamentoDias([o1, oOrfao], [p1])).toBe(10);
    });
  });
});
