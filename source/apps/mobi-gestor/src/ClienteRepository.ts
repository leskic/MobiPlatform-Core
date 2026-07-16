import type { Cliente, NovoCliente } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";

export class ClienteRepository {
  private readonly store: LocalStore<Cliente>;

  constructor(storage: KeyValueStorage) {
    this.store = new LocalStore<Cliente>("mobi-gestor.clientes", storage);
  }

  list(): Cliente[] {
    return this.store.list().sort((a, b) => b.criadoEm - a.criadoEm);
  }

  add(novo: NovoCliente, agora: number): Cliente {
    const cliente: Cliente = { ...novo, id: newId("cli"), criadoEm: agora };
    this.store.save([...this.store.list(), cliente]);
    return cliente;
  }
}
