import { valorLiquido, type MovimentoEstoque, type Orcamento } from "./GestorTypes";

// CP007 - financeiro: valor vendido, custo total, fluxo de caixa.
// Decisoes confirmadas com Charles (24/07/2026):
// - "Vendido" so conta orcamento FECHADO (fechadoEm != null), nao so
//   aprovado - e o mesmo evento que fecha o custo real (CP005).
// - Custo total usa custoRealTotal do fechamento - NAO soma compras de
//   estoque de novo aqui, pra nao contar a mesma compra 2x (pode ja
//   estar dentro do custoRealTotal registrado no fechamento).
// - Fluxo de caixa: entrada = valorLiquido no mes do fechadoEm; saida =
//   quantidade*precoUnitario de cada MovimentoEstoque ENTRADA no mes do
//   seu criadoEm. Saldo por mes, nao cumulativo (fora de escopo).

function orcamentosFechados(orcamentos: readonly Orcamento[]): Orcamento[] {
  return orcamentos.filter((orcamento) => orcamento.fechadoEm !== null);
}

export function valorTotalVendido(orcamentos: readonly Orcamento[]): number {
  return orcamentosFechados(orcamentos).reduce((soma, orcamento) => soma + valorLiquido(orcamento), 0);
}

export function custoTotalReal(orcamentos: readonly Orcamento[]): number {
  return orcamentosFechados(orcamentos).reduce((soma, orcamento) => soma + (orcamento.custoRealTotal ?? 0), 0);
}

export interface PontoFluxoCaixa {
  periodo: string; // "YYYY-MM", ordenavel como string
  entradas: number;
  saidas: number;
  saldo: number;
}

function periodoDe(timestampMs: number): string {
  const data = new Date(timestampMs);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${data.getFullYear()}-${mes}`;
}

export function computeFluxoCaixa(orcamentos: readonly Orcamento[], movimentos: readonly MovimentoEstoque[]): PontoFluxoCaixa[] {
  const porPeriodo = new Map<string, { entradas: number; saidas: number }>();

  const garantir = (periodo: string) => {
    const existente = porPeriodo.get(periodo);
    if (existente) return existente;
    const novo = { entradas: 0, saidas: 0 };
    porPeriodo.set(periodo, novo);
    return novo;
  };

  for (const orcamento of orcamentosFechados(orcamentos)) {
    // orcamentosFechados ja filtra fechadoEm != null, mas o TS nao sabe
    // disso sobre o campo do objeto original - garante aqui.
    if (orcamento.fechadoEm === null) continue;
    garantir(periodoDe(orcamento.fechadoEm)).entradas += valorLiquido(orcamento);
  }

  for (const movimento of movimentos) {
    if (movimento.tipo !== "ENTRADA") continue;
    const custo = movimento.quantidade * (movimento.precoUnitario ?? 0);
    garantir(periodoDe(movimento.criadoEm)).saidas += custo;
  }

  return [...porPeriodo.entries()]
    .map(([periodo, valores]) => ({ periodo, entradas: valores.entradas, saidas: valores.saidas, saldo: valores.entradas - valores.saidas }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

const MESES_PT: string[] = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function formatarPeriodo(periodo: string): string {
  const [anoTexto, mesTexto] = periodo.split("-");
  const mesIndex = Number(mesTexto) - 1;
  const nomeMes = MESES_PT[mesIndex] ?? mesTexto;
  return `${nomeMes}/${anoTexto}`;
}
