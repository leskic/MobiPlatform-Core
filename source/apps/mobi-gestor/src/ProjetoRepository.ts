import type { NovoProjeto, Projeto, StatusProjeto } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";

export class ProjetoRepository {
  private readonly store: LocalStore<Projeto>;

  constructor(storage: KeyValueStorage) {
    this.store = new LocalStore<Projeto>("mobi-gestor.projetos", storage);
  }

  list(): Projeto[] {
    return this.store.list().sort((a, b) => b.atualizadoEm - a.atualizadoEm);
  }

  listPorCliente(clienteId: string): Projeto[] {
    return this.list().filter((projeto) => projeto.clienteId === clienteId);
  }

  add(novo: NovoProjeto, agora: number): Projeto {
    const projeto: Projeto = { ...novo, id: newId("proj"), criadoEm: agora, atualizadoEm: agora };
    this.store.append(projeto);
    return projeto;
  }

  atualizarStatus(id: string, status: StatusProjeto, agora: number): Projeto | null {
    return this.store.update(
      (projeto) => projeto.id === id,
      (projeto) => ({ ...projeto, status, atualizadoEm: agora }),
    );
  }
}
