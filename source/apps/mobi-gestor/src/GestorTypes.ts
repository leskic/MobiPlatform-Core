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

export interface Projeto {
  id: string;
  clienteId: string;
  nome: string;
  status: StatusProjeto;
  prioridade: Prioridade;
  responsavel: string;
  criadoEm: number;
  atualizadoEm: number;
}

export type NovoProjeto = Omit<Projeto, "id" | "criadoEm" | "atualizadoEm">;

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
  status: StatusOrcamento;
  motivoPerda: string | null;
  criadoEm: number;
  atualizadoEm: number;
}

export type NovoOrcamento = Omit<Orcamento, "id" | "status" | "motivoPerda" | "criadoEm" | "atualizadoEm">;

export function valorLiquido(orcamento: Pick<Orcamento, "valor" | "descontoPercentual">): number {
  return orcamento.valor * (1 - orcamento.descontoPercentual / 100);
}
