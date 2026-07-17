import type { NovoOrcamento, Orcamento, StatusOrcamento } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";

export class OrcamentoRepository {
  private readonly store: LocalStore<Orcamento>;

  constructor(storage: KeyValueStorage) {
    this.store = new LocalStore<Orcamento>("mobi-gestor.orcamentos", storage);
  }

  list(): Orcamento[] {
    return this.store.list().sort((a, b) => b.atualizadoEm - a.atualizadoEm);
  }

  porProjeto(projetoId: string): Orcamento | null {
    return this.list().find((orcamento) => orcamento.projetoId === projetoId) ?? null;
  }

  add(novo: NovoOrcamento, agora: number): Orcamento {
    const orcamento: Orcamento = {
      ...novo,
      id: newId("orc"),
      status: "ABERTO",
      motivoPerda: null,
      custoRealTotal: null,
      fechadoEm: null,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    this.store.append(orcamento);
    return orcamento;
  }

  atualizarStatus(id: string, status: StatusOrcamento, agora: number, motivoPerda: string | null = null): Orcamento | null {
    return this.store.update(
      (orcamento) => orcamento.id === id,
      (orcamento) => ({
        ...orcamento,
        status,
        motivoPerda: status === "PERDIDO" ? motivoPerda : null,
        atualizadoEm: agora,
      }),
    );
  }

  // So permite registrar uma vez (fechadoEm null) e so num orcamento
  // APROVADO - o dado real e congelado assim que gravado, nunca editado
  // depois (ver comentario em GestorTypes.Orcamento).
  registrarFechamento(id: string, custoRealTotal: number, agora: number): Orcamento | null {
    return this.store.update(
      (orcamento) => orcamento.id === id && orcamento.status === "APROVADO" && orcamento.fechadoEm === null,
      (orcamento) => ({ ...orcamento, custoRealTotal, fechadoEm: agora, atualizadoEm: agora }),
    );
  }
}
