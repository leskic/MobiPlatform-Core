import type { MudancaEscopo, NovaMudancaEscopo } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";

export class MudancaEscopoRepository {
  private readonly store: LocalStore<MudancaEscopo>;

  constructor(storage: KeyValueStorage) {
    this.store = new LocalStore<MudancaEscopo>("mobi-gestor.mudancas-escopo", storage);
  }

  list(): MudancaEscopo[] {
    return this.store.list().sort((a, b) => b.registradoEm - a.registradoEm);
  }

  listPorProjeto(projetoId: string): MudancaEscopo[] {
    return this.list().filter((item) => item.projetoId === projetoId);
  }

  add(nova: NovaMudancaEscopo, agora: number): MudancaEscopo {
    const mudanca: MudancaEscopo = { ...nova, id: newId("mud"), registradoEm: agora };
    this.store.append(mudanca);
    return mudanca;
  }
}
