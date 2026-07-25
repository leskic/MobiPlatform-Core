import type { MovimentoEstoque, TipoMovimentoEstoque } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";

export interface NovoMovimentoEstoque {
  itemEstoqueId: string;
  tipo: TipoMovimentoEstoque;
  quantidade: number;
  projetoId: string | null;
  fornecedor: string | null;
  precoUnitario: number | null;
  motivo: string;
}

export class MovimentoEstoqueRepository {
  private readonly store: LocalStore<MovimentoEstoque>;

  constructor(storage: KeyValueStorage) {
    this.store = new LocalStore<MovimentoEstoque>("mobi-gestor.movimentos-estoque", storage);
  }

  list(): MovimentoEstoque[] {
    return this.store.list().sort((a, b) => b.criadoEm - a.criadoEm);
  }

  listPorItem(itemEstoqueId: string): MovimentoEstoque[] {
    return this.list().filter((movimento) => movimento.itemEstoqueId === itemEstoqueId);
  }

  add(novo: NovoMovimentoEstoque, agora: number): MovimentoEstoque {
    const movimento: MovimentoEstoque = { ...novo, id: newId("mov"), criadoEm: agora };
    this.store.append(movimento);
    return movimento;
  }
}
