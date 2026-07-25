import { DIAS_PARADO_LIMITE, ETAPAS_PRODUCAO, type EtapaProducao, type Orcamento, type Projeto } from "./GestorTypes";

// CP008 - indicadores/KPIs. Escopo confirmado com Charles (24/07/2026):
// - "Setor atrasando" = por ETAPA DE PRODUCAO (nao por responsavel).
// - "Ranking" = responsavel por projetos CONCLUIDO (nao cliente).
// - "Tempo medio" = do inicio (Projeto.criadoEm) ao fechamento
//   (Orcamento.fechadoEm) - nao por etapa (sistema nao guarda historico
//   de quando cada etapa comecou/terminou, so a atual).

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export interface EtapaAtrasada {
  etapa: EtapaProducao;
  quantidadeParada: number;
}

// Mesmo criterio de "parado" do AtencaoEngine (DIAS_PARADO_LIMITE),
// agrupado por etapa em vez de listado por projeto. So conta projetos
// em PRODUCAO. Devolve as 5 etapas sempre (mesmo com 0), mesmo padrao
// visual do Kanban (renderColunaProducao) - nao esconde etapa vazia.
export function etapasAtrasadas(projetos: readonly Projeto[], agora: number): EtapaAtrasada[] {
  const contagem = new Map<EtapaProducao, number>(ETAPAS_PRODUCAO.map((etapa) => [etapa, 0]));

  for (const projeto of projetos) {
    if (projeto.status !== "PRODUCAO" || !projeto.etapaProducao) continue;
    const diasSemAtualizacao = Math.floor((agora - projeto.atualizadoEm) / UM_DIA_MS);
    if (diasSemAtualizacao >= DIAS_PARADO_LIMITE) {
      contagem.set(projeto.etapaProducao, (contagem.get(projeto.etapaProducao) ?? 0) + 1);
    }
  }

  return ETAPAS_PRODUCAO.map((etapa) => ({ etapa, quantidadeParada: contagem.get(etapa) ?? 0 }));
}

export interface RankingResponsavel {
  responsavel: string;
  concluidos: number;
}

// So inclui responsavel com 1+ projeto CONCLUIDO, ordenado decrescente.
export function rankingResponsaveis(projetos: readonly Projeto[]): RankingResponsavel[] {
  const contagem = new Map<string, number>();
  for (const projeto of projetos) {
    if (projeto.status !== "CONCLUIDO") continue;
    contagem.set(projeto.responsavel, (contagem.get(projeto.responsavel) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([responsavel, concluidos]) => ({ responsavel, concluidos }))
    .sort((a, b) => b.concluidos - a.concluidos);
}

// Media, em dias, entre Projeto.criadoEm e Orcamento.fechadoEm - so
// conta orcamentos fechados cujo projeto ainda existe (projetoId
// orfao e ignorado silenciosamente, nao quebra o calculo). null se
// nao houver nenhum fechamento valido pra calcular media.
export function tempoMedioFechamentoDias(orcamentos: readonly Orcamento[], projetos: readonly Projeto[]): number | null {
  const projetoPorId = new Map(projetos.map((projeto) => [projeto.id, projeto]));
  const duracoes: number[] = [];

  for (const orcamento of orcamentos) {
    if (orcamento.fechadoEm === null) continue;
    const projeto = projetoPorId.get(orcamento.projetoId);
    if (!projeto) continue;
    duracoes.push((orcamento.fechadoEm - projeto.criadoEm) / UM_DIA_MS);
  }

  if (duracoes.length === 0) return null;
  const media = duracoes.reduce((soma, dias) => soma + dias, 0) / duracoes.length;
  return Math.round(media);
}
