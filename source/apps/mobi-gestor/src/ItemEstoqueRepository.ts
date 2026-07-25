import type { ItemEstoque, MovimentoEstoque, NovoItemEstoque, TipoMovimentoEstoque } from "./GestorTypes";
import { LocalStore, newId, type KeyValueStorage } from "./LocalStore";
import { MovimentoEstoqueRepository } from "./MovimentoEstoqueRepository";

export interface ResultadoMovimento {
  item: ItemEstoque;
  movimento: MovimentoEstoque;
}

export interface DadosMovimento {
  itemEstoqueId: string;
  tipo: TipoMovimentoEstoque;
  quantidade: number;
  // ENTRADA: obrigatorios. SAIDA: ignorados (sempre gravados como null).
  fornecedor: string | null;
  precoUnitario: number | null;
  // SAIDA: obrigatorio. ENTRADA: opcional (compra pro estoque geral,
  // nao necessariamente de um projeto - exceto MDF por convencao de
  // cadastro por cliente, ver ROADMAP.md).
  projetoId: string | null;
  motivo: string;
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
  // operacao. Rejeitado (retorna null, nada muda) quando:
  // - quantidade <= 0;
  // - SAIDA deixaria quantidadeAtual negativa;
  // - SAIDA sem projetoId (Charles, 24/07/2026 - toda saida precisa
  //   dizer pra qual projeto foi);
  // - ENTRADA sem fornecedor ou sem precoUnitario > 0 (e' uma compra,
  //   precisa registrar de quem e por quanto).
  // Mesmo idioma de guarda do OrcamentoRepository.registrarFechamento -
  // a regra de negocio vive no predicado do LocalStore.update.
  registrarMovimento(dados: DadosMovimento, agora: number): ResultadoMovimento | null {
    const { itemEstoqueId, tipo, quantidade, motivo } = dados;
    if (quantidade <= 0) return null;
    if (tipo === "SAIDA" && !dados.projetoId) return null;
    if (tipo === "ENTRADA" && (!dados.fornecedor || dados.precoUnitario === null || dados.precoUnitario <= 0)) return null;

    const delta = tipo === "ENTRADA" ? quantidade : -quantidade;
    const item = this.store.update(
      (candidato) => candidato.id === itemEstoqueId && candidato.quantidadeAtual + delta >= 0,
      (candidato) => ({ ...candidato, quantidadeAtual: candidato.quantidadeAtual + delta, atualizadoEm: agora }),
    );
    if (!item) return null;

    const movimento = this.movimentos.add(
      {
        itemEstoqueId,
        tipo,
        quantidade,
        motivo,
        projetoId: dados.projetoId,
        fornecedor: tipo === "ENTRADA" ? dados.fornecedor : null,
        precoUnitario: tipo === "ENTRADA" ? dados.precoUnitario : null,
      },
      agora,
    );
    return { item, movimento };
  }

  listMovimentosPorItem(itemEstoqueId: string): MovimentoEstoque[] {
    return this.movimentos.listPorItem(itemEstoqueId);
  }

  // CP007 - financeiro precisa de todas as compras (ENTRADA), nao por
  // item especifico, pra calcular o fluxo de caixa.
  listTodosMovimentos(): MovimentoEstoque[] {
    return this.movimentos.list();
  }
}
