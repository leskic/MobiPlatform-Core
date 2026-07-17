import { DIAS_PARADO_LIMITE, type ItemAtencao, type Projeto } from "./GestorTypes";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function computeAtencao(projetos: readonly Projeto[], agora: number): ItemAtencao[] {
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

  return itens.sort((a, b) => (a.severidade === b.severidade ? 0 : a.severidade === "error" ? -1 : 1));
}
