import { DIAS_PARADO_LIMITE, type ItemAtencao, type ItemEstoque, type Projeto } from "./GestorTypes";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

// CP006: itensEstoque e opcional (compat com as chamadas de teste
// existentes que so passam projetos+agora). Reaproveita o mesmo shape
// de ItemAtencao (projetoId/projetoNome) para itens de estoque abaixo
// do minimo - "projetoId" carrega o id do ItemEstoque nesse caso, ja
// que o painel de atencao e uma lista unica, nao dois tipos separados.
export function computeAtencao(
  projetos: readonly Projeto[],
  agora: number,
  itensEstoque: readonly ItemEstoque[] = [],
): ItemAtencao[] {
  const itens: ItemAtencao[] = [];

  for (const projeto of projetos) {
    if (projeto.status === "CONCLUIDO") continue;

    if (projeto.status === "ATRASADO") {
      itens.push({
        projetoId: projeto.id,
        projetoNome: projeto.nome,
        motivo: "Marcado como atrasado",
        severidade: "error",
      });
      continue;
    }

    const diasSemAtualizacao = Math.floor((agora - projeto.atualizadoEm) / UM_DIA_MS);
    if (diasSemAtualizacao >= DIAS_PARADO_LIMITE) {
      const etapa = projeto.status === "PRODUCAO" && projeto.etapaProducao ? ` (etapa ${projeto.etapaProducao})` : "";
      itens.push({
        projetoId: projeto.id,
        projetoNome: projeto.nome,
        motivo: `Sem atualização há ${diasSemAtualizacao} dias${etapa}`,
        severidade: "warning",
      });
    }
  }

  for (const item of itensEstoque) {
    if (item.quantidadeAtual < item.quantidadeMinima) {
      itens.push({
        projetoId: item.id,
        projetoNome: item.nome,
        motivo: `Estoque abaixo do mínimo (${item.quantidadeAtual} de ${item.quantidadeMinima} ${item.unidade})`,
        severidade: "warning",
      });
    }
  }

  return itens.sort((a, b) => (a.severidade === b.severidade ? 0 : a.severidade === "error" ? -1 : 1));
}
