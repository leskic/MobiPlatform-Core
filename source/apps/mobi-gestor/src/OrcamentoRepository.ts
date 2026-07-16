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
      criadoEm: agora,
      atualizadoEm: agora,
    };
    this.store.save([...this.store.list(), orcamento]);
    return orcamento;
  }

  atualizarStatus(id: string, status: StatusOrcamento, agora: number, motivoPerda: string | null = null): Orcamento | null {
    const orcamentos = this.store.list();
    const index = orcamentos.findIndex((orcamento) => orcamento.id === id);
    if (index === -1) return null;
    const atual = orcamentos[index]!;
    const atualizado: Orcamento = {
      ...atual,
      status,
      motivoPerda: status === "PERDIDO" ? motivoPerda : null,
      atualizadoEm: agora,
    };
    orcamentos[index] = atualizado;
    this.store.save(orcamentos);
    return atualizado;
  }
}
