import type { ItemLevantamento, NovoItemLevantamento } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";

export class ItemLevantamentoRepository {
  private readonly store: LocalStore<ItemLevantamento>;

  constructor(storage: KeyValueStorage) {
    this.store = new LocalStore<ItemLevantamento>("mobi-gestor.itens-levantamento", storage);
  }

  list(): ItemLevantamento[] {
    return this.store.list().sort((a, b) => b.criadoEm - a.criadoEm);
  }

  listPorProjeto(projetoId: string): ItemLevantamento[] {
    return this.list().filter((item) => item.projetoId === projetoId);
  }

  addMuitos(novos: readonly NovoItemLevantamento[], agora: number): ItemLevantamento[] {
    const criados = novos.map((novo) => ({ ...novo, id: newId("item"), criadoEm: agora }));
    for (const item of criados) this.store.append(item);
    return criados;
  }

  remover(id: string): boolean {
    const itens = this.store.list();
    const restantes = itens.filter((item) => item.id !== id);
    if (restantes.length === itens.length) return false;
    this.store.save(restantes);
    return true;
  }
}
