import type { ItemEstoque, MovimentoEstoque, NovoItemEstoque, TipoMovimentoEstoque } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";
import { MovimentoEstoqueRepository } from "./MovimentoEstoqueRepository";

export interface ResultadoMovimento {
  item: ItemEstoque;
  movimento: MovimentoEstoque;
}

export class ItemEstoqueRepository {
  private readonly store: LocalStore<ItemEstoque>;
  private readonly movimentos: MovimentoEstoqueRepository;

  constructor(storage: KeyValueStorage) {
    this.store = new LocalStore<ItemEstoque>("mobi-gestor.itens-estoque", storage);
    this.movimentos = new MovimentoEstoqueRepository(storage);
  }

  list(): ItemEstoque[] {
    return this.store.list().sort((a, b) => a.nome.localeCompare(b.nome));
  }

  add(novo: NovoItemEstoque, agora: number): ItemEstoque {
    const item: ItemEstoque = { ...novo, id: newId("est"), quantidadeAtual: 0, criadoEm: agora, atualizadoEm: agora };
    this.store.append(item);
    return item;
  }

  // Registra o movimento e atualiza a quantidade do item na mesma
  // operacao. SAIDA que deixaria quantidadeAtual negativa e rejeitada -
  // o predicado de LocalStore.update nao bate, nada muda (nem o item,
  // nem o movimento e criado), mesmo idioma de
  // OrcamentoRepository.registrarFechamento.
  registrarMovimento(
    itemEstoqueId: string,
    tipo: TipoMovimentoEstoque,
    quantidade: number,
    projetoId: string | null,
    motivo: string,
    agora: number,
  ): ResultadoMovimento | null {
    if (quantidade <= 0) return null;
    const delta = tipo === "ENTRADA" ? quantidade : -quantidade;
    const item = this.store.update(
      (candidato) => candidato.id === itemEstoqueId && candidato.quantidadeAtual + delta >= 0,
      (candidato) => ({ ...candidato, quantidadeAtual: candidato.quantidadeAtual + delta, atualizadoEm: agora }),
    );
    if (!item) return null;

    const movimento = this.movimentos.add({ itemEstoqueId, tipo, quantidade, projetoId, motivo }, agora);
    return { item, movimento };
  }

  listMovimentosPorItem(itemEstoqueId: string): MovimentoEstoque[] {
    return this.movimentos.listPorItem(itemEstoqueId);
  }
}
