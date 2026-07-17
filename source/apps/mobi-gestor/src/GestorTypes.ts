export type OrigemLead = "whatsapp" | "instagram" | "site" | "indicacao" | "telefone" | "visita";

export interface Cliente {
  id: string;
  nome: string;
  contato: string;
  origem: OrigemLead;
  interesse: string;
  responsavel: string;
  criadoEm: number;
}

export type NovoCliente = Omit<Cliente, "id" | "criadoEm">;

export type StatusProjeto =
  | "NOVO"
  | "LEVANTAMENTO"
  | "ORCAMENTO"
  | "PRODUCAO"
  | "MONTAGEM"
  | "CONCLUIDO"
  | "ATRASADO"
  | "PARADO";

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA";

// Etapas dentro do status PRODUCAO (CP004) - granularidade da fila de
// producao. So tem sentido enquanto status === "PRODUCAO"; nula em
// qualquer outro status.
export type EtapaProducao = "FILA" | "CORTE" | "MONTAGEM_ESTRUTURA" | "ACABAMENTO" | "ENTREGA";

export const ETAPAS_PRODUCAO: EtapaProducao[] = ["FILA", "CORTE", "MONTAGEM_ESTRUTURA", "ACABAMENTO", "ENTREGA"];

export interface Projeto {
  id: string;
  clienteId: string;
  nome: string;
  status: StatusProjeto;
  prioridade: Prioridade;
  responsavel: string;
  etapaProducao: EtapaProducao | null;
  criadoEm: number;
  atualizadoEm: number;
}

export type NovoProjeto = Omit<Projeto, "id" | "criadoEm" | "atualizadoEm" | "etapaProducao">;

export type SeveridadeAtencao = "warning" | "error";

export interface ItemAtencao {
  projetoId: string;
  projetoNome: string;
  motivo: string;
  severidade: SeveridadeAtencao;
}

export const DIAS_PARADO_LIMITE = 7;

export type StatusOrcamento = "ABERTO" | "NEGOCIANDO" | "APROVADO" | "PERDIDO";

export interface Orcamento {
  id: string;
  projetoId: string;
  valor: number;
  descontoPercentual: number;
  margemPercentual: number;
  comissaoPercentual: number;
  // Calculadora de custo real (CP003b) - opcional. Quando preenchida,
  // "valor" acima e o preco de venda SUGERIDO por ela, mas o usuario
  // ainda pode digitar um valor direto sem usar a calculadora.
  custoMateriaPrima: number | null;
  custoMaoDeObra: number | null;
  custoFixoRateado: number | null;
  markupPercentual: number | null;
  status: StatusOrcamento;
  motivoPerda: string | null;
  // Fechamento do projeto (CP004... na verdade CP005) - custo real medido
  // ao final, comparado contra o custo estimado nos campos acima. So
  // preenchido uma vez, quando o projeto e encerrado; nao e editavel
  // depois (e o "dado real" que alimenta aprendizado futuro, precisa ficar
  // congelado). null enquanto o projeto nao foi encerrado.
  custoRealTotal: number | null;
  fechadoEm: number | null;
  criadoEm: number;
  atualizadoEm: number;
}

export type NovoOrcamento = Omit<
  Orcamento,
  "id" | "status" | "motivoPerda" | "custoRealTotal" | "fechadoEm" | "criadoEm" | "atualizadoEm"
>;

export function valorLiquido(orcamento: Pick<Orcamento, "valor" | "descontoPercentual">): number {
  return orcamento.valor * (1 - orcamento.descontoPercentual / 100);
}

export interface CustosOrcamento {
  custoMateriaPrima: number;
  custoMaoDeObra: number;
  custoFixoRateado: number;
  markupPercentual: number;
}

export function custoTotalOrcamento(custos: CustosOrcamento): number {
  return custos.custoMateriaPrima + custos.custoMaoDeObra + custos.custoFixoRateado;
}

// Espelha a logica real da planilha de precificacao da empresa (aba
// RESULTADO): preco de venda = custo de fabricacao + despesas (markup %
// sobre o custo). Simplificado - nao rateia mao de obra por
// pessoa/etapa como a planilha real, so um total.
export function precoVendaSugerido(custos: CustosOrcamento): number {
  const custoTotal = custoTotalOrcamento(custos);
  return custoTotal * (1 + custos.markupPercentual / 100);
}

export type OrigemItemLevantamento = "pdf" | "manual";

export interface ItemLevantamento {
  id: string;
  projetoId: string;
  nome: string;
  origem: OrigemItemLevantamento;
  paginaPdf: number | null;
  criadoEm: number;
}

export type NovoItemLevantamento = Omit<ItemLevantamento, "id" | "criadoEm">;

// CP005 - log de mudanca de escopo durante a execucao do projeto.
// Categorias fixas (nao texto livre) para dar pra agregar depois - mesma
// disciplina de "poucos tipos reutilizaveis" da Biblioteca Oficial.
export type CategoriaMudancaEscopo =
  | "CLIENTE_ADICIONOU"
  | "CLIENTE_REMOVEU"
  | "CLIENTE_TROCOU_MATERIAL"
  | "MEDIDA_DIVERGENTE"
  | "OUTRO";

export interface MudancaEscopo {
  id: string;
  projetoId: string;
  categoria: CategoriaMudancaEscopo;
  descricao: string;
  registradoEm: number;
}

export type NovaMudancaEscopo = Omit<MudancaEscopo, "id" | "registradoEm">;

export interface ComparativoFechamento {
  custoEstimado: number;
  custoReal: number;
  diferenca: number;
}

export function compararFechamento(orcamento: Pick<Orcamento, "custoRealTotal" | "custoMateriaPrima" | "custoMaoDeObra" | "custoFixoRateado" | "valor">): ComparativoFechamento | null {
  if (orcamento.custoRealTotal === null) return null;
  const custoEstimado =
    orcamento.custoMateriaPrima !== null || orcamento.custoMaoDeObra !== null || orcamento.custoFixoRateado !== null
      ? custoTotalOrcamento({
          custoMateriaPrima: orcamento.custoMateriaPrima ?? 0,
          custoMaoDeObra: orcamento.custoMaoDeObra ?? 0,
          custoFixoRateado: orcamento.custoFixoRateado ?? 0,
          markupPercentual: 0,
        })
      : orcamento.valor;
  return {
    custoEstimado,
    custoReal: orcamento.custoRealTotal,
    diferenca: orcamento.custoRealTotal - custoEstimado,
  };
}
