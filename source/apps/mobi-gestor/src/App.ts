import { computeAtencao } from "./AtencaoEngine";
import { ClienteRepository } from "./ClienteRepository";
import { computeFluxoCaixa, custoTotalReal, formatarPeriodo, valorTotalVendido } from "./FinanceiroEngine";
import { etapasAtrasadas, rankingResponsaveis, tempoMedioFechamentoDias } from "./IndicadoresEngine";
import type {
  CategoriaMudancaEscopo,
  Cliente,
  EtapaProducao,
  ItemEstoque,
  ItemLevantamento,
  MovimentoEstoque,
  MudancaEscopo,
  Orcamento,
  OrigemLead,
  Prioridade,
  Projeto,
  StatusOrcamento,
  StatusProjeto,
  TipoMovimentoEstoque,
} from "./GestorTypes";
import { compararFechamento, ETAPAS_PRODUCAO, precoVendaSugerido, valorLiquido } from "./GestorTypes";
import type { ItemCandidato } from "./ItemCandidateHeuristic";
import { ItemEstoqueRepository } from "./ItemEstoqueRepository";
import { ItemLevantamentoRepository } from "./ItemLevantamentoRepository";
import { MudancaEscopoRepository } from "./MudancaEscopoRepository";
import { OrcamentoRepository } from "./OrcamentoRepository";
import { ProjetoRepository } from "./ProjetoRepository";

const ORIGENS: OrigemLead[] = ["whatsapp", "instagram", "site", "indicacao", "telefone", "visita"];
const STATUS: StatusProjeto[] = ["NOVO", "LEVANTAMENTO", "ORCAMENTO", "PRODUCAO", "MONTAGEM", "CONCLUIDO", "ATRASADO", "PARADO"];
const PRIORIDADES: Prioridade[] = ["BAIXA", "MEDIA", "ALTA"];
const PRIORIDADE_ORDEM: Record<Prioridade, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
const CATEGORIAS_MUDANCA_ESCOPO: CategoriaMudancaEscopo[] = [
  "CLIENTE_ADICIONOU",
  "CLIENTE_REMOVEU",
  "CLIENTE_TROCOU_MATERIAL",
  "MEDIDA_DIVERGENTE",
  "OUTRO",
];

const ORIGEM_LABEL: Record<OrigemLead, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  site: "Site",
  indicacao: "Indicação",
  telefone: "Telefone",
  visita: "Visita",
};

const STATUS_LABEL: Record<StatusProjeto, string> = {
  NOVO: "Novo",
  LEVANTAMENTO: "Levantamento",
  ORCAMENTO: "Orçamento",
  PRODUCAO: "Produção",
  MONTAGEM: "Montagem",
  CONCLUIDO: "Concluído",
  ATRASADO: "Atrasado",
  PARADO: "Parado",
};

const PRIORIDADE_LABEL: Record<Prioridade, string> = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta" };

const ETAPA_LABEL: Record<EtapaProducao, string> = {
  FILA: "Fila",
  CORTE: "Corte",
  MONTAGEM_ESTRUTURA: "Montagem estrutura",
  ACABAMENTO: "Acabamento",
  ENTREGA: "Embalagem/Entrega",
};

const STATUS_ORCAMENTO_LABEL: Record<StatusOrcamento, string> = {
  ABERTO: "Aberto",
  NEGOCIANDO: "Negociando",
  APROVADO: "Aprovado",
  PERDIDO: "Perdido",
};

const CATEGORIA_MUDANCA_LABEL: Record<CategoriaMudancaEscopo, string> = {
  CLIENTE_ADICIONOU: "Cliente adicionou",
  CLIENTE_REMOVEU: "Cliente removeu",
  CLIENTE_TROCOU_MATERIAL: "Cliente trocou material",
  MEDIDA_DIVERGENTE: "Medida divergente do levantamento",
  OUTRO: "Outro",
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export class App {
  private readonly clientes: ClienteRepository;
  private readonly projetos: ProjetoRepository;
  private readonly orcamentos: OrcamentoRepository;
  private readonly itensLevantamento: ItemLevantamentoRepository;
  private readonly mudancasEscopo: MudancaEscopoRepository;
  private readonly itensEstoque: ItemEstoqueRepository;
  // Candidatos extraidos de um PDF, aguardando confirmacao do usuario.
  // Transiente de proposito - nao persiste, some se a pagina recarregar.
  private readonly candidatosPendentes = new Map<string, ItemCandidato[]>();
  private importandoProjetoId: string | null = null;

  constructor(private readonly root: HTMLElement) {
    this.clientes = new ClienteRepository(window.localStorage);
    this.projetos = new ProjetoRepository(window.localStorage);
    this.orcamentos = new OrcamentoRepository(window.localStorage);
    this.itensLevantamento = new ItemLevantamentoRepository(window.localStorage);
    this.mudancasEscopo = new MudancaEscopoRepository(window.localStorage);
    this.itensEstoque = new ItemEstoqueRepository(window.localStorage);
  }

  mount(): void {
    this.render();
  }

  private render(): void {
    const clientes = this.clientes.list();
    const projetos = this.projetos.list();
    const orcamentos = this.orcamentos.list();
    const itensLevantamento = this.itensLevantamento.list();
    const mudancasEscopo = this.mudancasEscopo.list();
    const itensEstoque = this.itensEstoque.list();
    const movimentosEstoque = this.itensEstoque.listTodosMovimentos();
    const agora = Date.now();
    const atencao = computeAtencao(projetos, agora, itensEstoque);

    const emNegociacao = orcamentos
      .filter((o) => o.status === "ABERTO" || o.status === "NEGOCIANDO")
      .reduce((soma, o) => soma + valorLiquido(o), 0);

    const clientePorId = new Map(clientes.map((c) => [c.id, c]));
    const orcamentoPorProjeto = new Map<string, Orcamento>();
    for (const o of orcamentos) {
      if (!orcamentoPorProjeto.has(o.projetoId)) orcamentoPorProjeto.set(o.projetoId, o);
    }

    this.root.innerHTML = `
      <div class="gestor">
        <header class="topbar">
          <div class="brand">
            <span class="brand-mark">MG</span>
            <div>
              <h1>Mobi Gestor</h1>
              <p class="eyebrow">Painel do dia — CP005</p>
            </div>
          </div>
          <div class="topbar-stats">
            <div class="stat"><span class="stat-value">${clientes.length}</span><span class="stat-label">clientes</span></div>
            <div class="stat"><span class="stat-value">${projetos.length}</span><span class="stat-label">projetos</span></div>
            <div class="stat stat-${atencao.length > 0 ? "alert" : "ok"}"><span class="stat-value">${atencao.length}</span><span class="stat-label">precisam de atenção</span></div>
            <div class="stat"><span class="stat-value stat-money">${moeda.format(emNegociacao)}</span><span class="stat-label">em negociação</span></div>
          </div>
        </header>

        <section class="atencao-panel">
          <h2 class="section-title">O que precisa da sua atenção</h2>
          <div class="atencao-list" id="atencao-panel">
            ${
              atencao.length === 0
                ? '<p class="atencao-vazia">Tudo em dia — nenhum projeto atrasado ou parado.</p>'
                : atencao
                    .map(
                      (item) => `
                  <div class="atencao-item atencao-${item.severidade}">
                    <span class="atencao-dot"></span>
                    <span class="atencao-nome">${escapeHtml(item.projetoNome)}</span>
                    <span class="atencao-motivo">${escapeHtml(item.motivo)}</span>
                  </div>`,
                    )
                    .join("")
            }
          </div>
        </section>

        ${renderProducao(projetos, clientePorId, agora)}

        <div class="columns">
          <section class="painel" id="painel-clientes">
            <div class="painel-head">
              <h2 class="section-title">Clientes</h2>
              <span class="contagem">${clientes.length}</span>
            </div>
            <form id="form-cliente" class="form">
              <label class="field"><span>Nome</span><input name="nome" placeholder="Nome do cliente" required /></label>
              <label class="field"><span>Contato</span><input name="contato" placeholder="Telefone ou e-mail" required /></label>
              <div class="field-row">
                <label class="field"><span>Origem</span><select name="origem">${ORIGENS.map((o) => `<option value="${o}">${ORIGEM_LABEL[o]}</option>`).join("")}</select></label>
                <label class="field"><span>Responsável</span><input name="responsavel" placeholder="Quem atende" required /></label>
              </div>
              <label class="field"><span>Interesse</span><input name="interesse" placeholder="Ex.: cozinha planejada" /></label>
              <button type="submit" class="btn-primary">+ Adicionar cliente</button>
            </form>
            <ul class="lista">
              ${clientes
                .map(
                  (c) => `<li class="card-cliente">
                    <span class="avatar">${initials(c.nome)}</span>
                    <div class="card-info">
                      <b>${escapeHtml(c.nome)}</b>
                      <span class="muted">${escapeHtml(c.contato)}${c.interesse ? " · " + escapeHtml(c.interesse) : ""}</span>
                    </div>
                    <span class="tag tag-origem">${ORIGEM_LABEL[c.origem]}</span>
                  </li>`,
                )
                .join("") || '<li class="vazio">Nenhum cliente cadastrado ainda.</li>'}
            </ul>
          </section>

          <section class="painel" id="painel-projetos">
            <div class="painel-head">
              <h2 class="section-title">Projetos</h2>
              <span class="contagem">${projetos.length}</span>
            </div>
            <form id="form-projeto" class="form">
              <label class="field"><span>Cliente</span>
                <select name="clienteId" required>
                  <option value="" disabled selected>Selecione o cliente</option>
                  ${clientes.map((c) => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join("")}
                </select>
              </label>
              <label class="field"><span>Nome do projeto</span><input name="nome" placeholder="Ex.: Cozinha Torres" required /></label>
              <div class="field-row">
                <label class="field"><span>Status inicial</span><select name="status">${STATUS.map((s) => `<option value="${s}">${STATUS_LABEL[s]}</option>`).join("")}</select></label>
                <label class="field"><span>Prioridade</span><select name="prioridade">${PRIORIDADES.map((p) => `<option value="${p}">${PRIORIDADE_LABEL[p]}</option>`).join("")}</select></label>
              </div>
              <label class="field"><span>Responsável</span><input name="responsavel" placeholder="Quem conduz" required /></label>
              <button type="submit" class="btn-primary" ${clientes.length === 0 ? "disabled" : ""}>+ Adicionar projeto</button>
              ${clientes.length === 0 ? '<p class="hint">Cadastre um cliente primeiro.</p>' : ""}
            </form>
            <ul class="lista">
              ${
                projetos
                  .map((p) =>
                    renderProjetoCard(
                      p,
                      clientePorId.get(p.clienteId),
                      orcamentoPorProjeto.get(p.id) ?? null,
                      agora,
                      itensLevantamento.filter((item) => item.projetoId === p.id),
                      this.candidatosPendentes.get(p.id) ?? null,
                      this.importandoProjetoId === p.id,
                      mudancasEscopo.filter((m) => m.projetoId === p.id),
                    ),
                  )
                  .join("") || '<li class="vazio">Nenhum projeto cadastrado ainda.</li>'
              }
            </ul>
          </section>
        </div>

        ${renderEstoque(itensEstoque, projetos)}
        ${renderFinanceiro(orcamentos, movimentosEstoque)}
        ${renderIndicadores(projetos, orcamentos, agora)}
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const formCliente = this.root.querySelector<HTMLFormElement>("#form-cliente");
    formCliente?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(formCliente);
      const nome = String(data.get("nome") ?? "").trim();
      const contato = String(data.get("contato") ?? "").trim();
      const responsavel = String(data.get("responsavel") ?? "").trim();
      if (!nome || !contato || !responsavel) {
        window.alert("Preencha nome, contato e responsável.");
        return;
      }
      this.clientes.add(
        {
          nome,
          contato,
          origem: (data.get("origem") as OrigemLead) ?? "site",
          interesse: String(data.get("interesse") ?? "").trim(),
          responsavel,
        },
        Date.now(),
      );
      this.render();
    });

    const formProjeto = this.root.querySelector<HTMLFormElement>("#form-projeto");
    formProjeto?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(formProjeto);
      const clienteId = String(data.get("clienteId") ?? "");
      const nome = String(data.get("nome") ?? "").trim();
      const responsavel = String(data.get("responsavel") ?? "").trim();
      if (!clienteId || !nome || !responsavel) {
        window.alert("Selecione o cliente e preencha nome e responsável.");
        return;
      }
      this.projetos.add(
        {
          clienteId,
          nome,
          status: (data.get("status") as StatusProjeto) ?? "NOVO",
          prioridade: (data.get("prioridade") as Prioridade) ?? "MEDIA",
          responsavel,
        },
        Date.now(),
      );
      this.render();
    });

    this.root.querySelectorAll<HTMLSelectElement>(".status-select").forEach((select) => {
      select.addEventListener("change", () => {
        const projetoId = select.dataset["projetoId"];
        if (!projetoId) return;
        this.projetos.atualizarStatus(projetoId, select.value as StatusProjeto, Date.now());
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLSelectElement>(".etapa-select").forEach((select) => {
      select.addEventListener("change", () => {
        const projetoId = select.dataset["projetoId"];
        if (!projetoId) return;
        this.projetos.avancarEtapaProducao(projetoId, select.value as EtapaProducao, Date.now());
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLFormElement>(".form-orcamento").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const projetoId = form.dataset["projetoId"];
        if (!projetoId) return;
        const data = new FormData(form);
        const valor = Number(data.get("valor"));
        const descontoPercentual = clampPercentual(data.get("desconto"));
        const margemPercentual = clampPercentual(data.get("margem"));
        const comissaoPercentual = clampPercentual(data.get("comissao"));
        if (!Number.isFinite(valor) || valor <= 0) {
          window.alert("Informe um valor de orçamento maior que zero.");
          return;
        }
        this.orcamentos.add(
          {
            projetoId,
            valor,
            descontoPercentual,
            margemPercentual,
            comissaoPercentual,
            custoMateriaPrima: parseCustoOpcional(data.get("custoMp")),
            custoMaoDeObra: parseCustoOpcional(data.get("custoMo")),
            custoFixoRateado: parseCustoOpcional(data.get("custoFixo")),
            markupPercentual: parseCustoOpcional(data.get("markup")),
          },
          Date.now(),
        );
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>(".calcular-preco-sugerido").forEach((button) => {
      button.addEventListener("click", () => {
        const form = button.closest("form");
        if (!form) return;
        const custoMateriaPrima = parseCustoOpcional(form.querySelector<HTMLInputElement>("[name=custoMp]")?.value ?? null) ?? 0;
        const custoMaoDeObra = parseCustoOpcional(form.querySelector<HTMLInputElement>("[name=custoMo]")?.value ?? null) ?? 0;
        const custoFixoRateado = parseCustoOpcional(form.querySelector<HTMLInputElement>("[name=custoFixo]")?.value ?? null) ?? 0;
        const markupPercentual = parseCustoOpcional(form.querySelector<HTMLInputElement>("[name=markup]")?.value ?? null) ?? 0;
        if (custoMateriaPrima === 0 && custoMaoDeObra === 0 && custoFixoRateado === 0) {
          window.alert("Preencha ao menos matéria-prima, mão de obra ou custo fixo pra calcular.");
          return;
        }
        const sugestao = precoVendaSugerido({ custoMateriaPrima, custoMaoDeObra, custoFixoRateado, markupPercentual });
        const campoValor = form.querySelector<HTMLInputElement>("[name=valor]");
        if (campoValor) campoValor.value = sugestao.toFixed(2);
      });
    });

    this.root.querySelectorAll<HTMLSelectElement>(".status-orcamento-select").forEach((select) => {
      select.addEventListener("change", () => {
        const orcamentoId = select.dataset["orcamentoId"];
        if (!orcamentoId) return;
        const novoStatus = select.value as StatusOrcamento;
        let motivo: string | null = null;
        if (novoStatus === "PERDIDO") {
          motivo = (window.prompt("Motivo da perda:", "") ?? "").trim();
          if (motivo === "") {
            this.render();
            return;
          }
        }
        this.orcamentos.atualizarStatus(orcamentoId, novoStatus, Date.now(), motivo);
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLFormElement>(".form-fechamento").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const orcamentoId = form.dataset["orcamentoId"];
        if (!orcamentoId) return;
        const data = new FormData(form);
        const custoReal = Number(data.get("custoReal"));
        if (!Number.isFinite(custoReal) || custoReal < 0) {
          window.alert("Informe um custo real válido.");
          return;
        }
        this.orcamentos.registrarFechamento(orcamentoId, custoReal, Date.now());
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLFormElement>(".form-mudanca-escopo").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const projetoId = form.dataset["projetoId"];
        if (!projetoId) return;
        const data = new FormData(form);
        this.mudancasEscopo.add(
          {
            projetoId,
            categoria: (data.get("categoria") as CategoriaMudancaEscopo) ?? "OUTRO",
            descricao: String(data.get("descricao") ?? "").trim(),
          },
          Date.now(),
        );
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLInputElement>(".importar-pdf-input").forEach((input) => {
      input.addEventListener("change", () => {
        const projetoId = input.dataset["projetoId"];
        const file = input.files?.[0];
        if (!projetoId || !file) return;
        void this.importarPdf(projetoId, file);
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>(".confirmar-levantamento").forEach((button) => {
      button.addEventListener("click", () => {
        const projetoId = button.dataset["projetoId"];
        if (!projetoId) return;
        const candidatos = this.candidatosPendentes.get(projetoId);
        if (!candidatos) return;
        const container = this.root.querySelector(`.levantamento-revisao[data-projeto-id="${projetoId}"]`);
        const marcados = new Set(
          [...(container?.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked") ?? [])].map((input) =>
            Number(input.dataset["index"]),
          ),
        );
        const selecionados = candidatos.filter((_, index) => marcados.has(index));
        if (selecionados.length > 0) {
          this.itensLevantamento.addMuitos(
            selecionados.map((c) => ({ projetoId, nome: c.texto, origem: "pdf" as const, paginaPdf: c.pagina })),
            Date.now(),
          );
        }
        this.candidatosPendentes.delete(projetoId);
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>(".cancelar-levantamento").forEach((button) => {
      button.addEventListener("click", () => {
        const projetoId = button.dataset["projetoId"];
        if (!projetoId) return;
        this.candidatosPendentes.delete(projetoId);
        this.render();
      });
    });

    const formItemEstoque = this.root.querySelector<HTMLFormElement>("#form-item-estoque");
    formItemEstoque?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(formItemEstoque);
      const nome = String(data.get("nome") ?? "").trim();
      const unidade = String(data.get("unidade") ?? "").trim();
      const quantidadeMinima = Number(data.get("quantidadeMinima"));
      if (!nome || !unidade || !Number.isFinite(quantidadeMinima) || quantidadeMinima < 0) {
        window.alert("Preencha nome, unidade e uma quantidade mínima válida (0 ou mais).");
        return;
      }
      this.itensEstoque.add({ nome, unidade, quantidadeMinima }, Date.now());
      this.render();
    });

    this.root.querySelectorAll<HTMLFormElement>(".form-movimento-estoque").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const itemEstoqueId = form.dataset["itemEstoqueId"];
        if (!itemEstoqueId) return;
        const data = new FormData(form);
        const tipo = data.get("tipo") as TipoMovimentoEstoque;
        const quantidade = Number(data.get("quantidade"));
        const projetoId = String(data.get("projetoId") ?? "") || null;
        const motivo = String(data.get("motivo") ?? "").trim();
        const fornecedor = String(data.get("fornecedor") ?? "").trim() || null;
        const precoUnitario = parseCustoOpcional(data.get("precoUnitario"));

        if (!Number.isFinite(quantidade) || quantidade <= 0) {
          window.alert("Informe uma quantidade maior que zero.");
          return;
        }
        if (tipo === "SAIDA" && !projetoId) {
          window.alert("Selecione o projeto — toda saída precisa estar vinculada a um projeto.");
          return;
        }
        if (tipo === "ENTRADA" && (!fornecedor || precoUnitario === null || precoUnitario <= 0)) {
          window.alert("Informe o fornecedor e o preço de compra (maior que zero) na entrada.");
          return;
        }

        const resultado = this.itensEstoque.registrarMovimento(
          { itemEstoqueId, tipo, quantidade, projetoId, motivo, fornecedor, precoUnitario },
          Date.now(),
        );
        if (!resultado) {
          window.alert("Saída maior que o estoque disponível — não é possível deixar a quantidade negativa.");
          return;
        }
        this.render();
      });
    });

    this.root.querySelectorAll<HTMLSelectElement>(".movimento-tipo-select").forEach((select) => {
      select.addEventListener("change", () => toggleCamposMovimento(select));
      toggleCamposMovimento(select);
    });
  }

  private async importarPdf(projetoId: string, file: File): Promise<void> {
    this.importandoProjetoId = projetoId;
    this.render();
    try {
      const { extrairLinhas, candidatosDeItens } = await import("./PdfImporter");
      const buffer = await file.arrayBuffer();
      const linhas = await extrairLinhas(buffer);
      const candidatos = candidatosDeItens(linhas);
      this.candidatosPendentes.set(projetoId, candidatos);
      if (candidatos.length === 0) {
        window.alert("Nenhum texto reconhecível encontrado nesse PDF.");
      }
    } catch (error) {
      window.alert(`Não consegui ler esse PDF: ${error instanceof Error ? error.message : "erro desconhecido"}`);
    } finally {
      this.importandoProjetoId = null;
      this.render();
    }
  }
}

function renderProducao(projetos: Projeto[], clientePorId: Map<string, Cliente>, agora: number): string {
  const emProducao = projetos.filter((p) => p.status === "PRODUCAO");

  return `
    <section class="painel producao-board" id="painel-producao">
      <div class="painel-head">
        <h2 class="section-title">Produção — fila de trabalho</h2>
        <span class="contagem">${emProducao.length}</span>
      </div>
      ${
        emProducao.length === 0
          ? '<p class="vazio">Nenhum projeto em produção agora — mude o status de um projeto para "Produção" pra ele entrar na fila.</p>'
          : `<div class="producao-colunas">
              ${ETAPAS_PRODUCAO.map((etapa) => renderColunaProducao(etapa, emProducao, clientePorId, agora)).join("")}
            </div>`
      }
    </section>`;
}

function renderColunaProducao(
  etapa: EtapaProducao,
  projetos: Projeto[],
  clientePorId: Map<string, Cliente>,
  agora: number,
): string {
  const itens = projetos
    .filter((p) => (p.etapaProducao ?? "FILA") === etapa)
    .sort((a, b) => PRIORIDADE_ORDEM[a.prioridade] - PRIORIDADE_ORDEM[b.prioridade] || a.atualizadoEm - b.atualizadoEm);

  return `
    <div class="producao-coluna">
      <div class="producao-coluna-head">
        <span>${ETAPA_LABEL[etapa]}</span>
        <span class="contagem">${itens.length}</span>
      </div>
      <div class="producao-coluna-itens">
        ${
          itens
            .map((p) => {
              const cliente = clientePorId.get(p.clienteId);
              const dias = Math.max(0, Math.floor((agora - p.atualizadoEm) / 86400000));
              return `<div class="card-producao">
                <div class="card-producao-top">
                  <b>${escapeHtml(p.nome)}</b>
                  <span class="muted prioridade-${p.prioridade}">${PRIORIDADE_LABEL[p.prioridade]}</span>
                </div>
                <div class="card-producao-meta muted">
                  ${cliente ? escapeHtml(cliente.nome) : "cliente removido"} · ${escapeHtml(p.responsavel)}
                </div>
                <div class="card-producao-meta muted">${dias === 0 ? "atualizado hoje" : `parado há ${dias}d`}</div>
                <select data-projeto-id="${p.id}" class="etapa-select">
                  ${ETAPAS_PRODUCAO.map((e) => `<option value="${e}" ${e === etapa ? "selected" : ""}>${ETAPA_LABEL[e]}</option>`).join("")}
                </select>
              </div>`;
            })
            .join("") || '<p class="vazio-coluna muted">Vazio</p>'
        }
      </div>
    </div>`;
}

function renderProjetoCard(
  p: Projeto,
  cliente: Cliente | undefined,
  orcamento: Orcamento | null,
  agora: number,
  itensLevantamento: ItemLevantamento[],
  candidatos: ItemCandidato[] | null,
  importando: boolean,
  mudancasEscopo: MudancaEscopo[],
): string {
  const dias = Math.max(0, Math.floor((agora - p.atualizadoEm) / 86400000));
  return `<li class="card-projeto">
    <div class="card-projeto-top">
      <b>${escapeHtml(p.nome)}</b>
      <span class="badge badge-${p.status}">${STATUS_LABEL[p.status]}</span>
    </div>
    <div class="card-projeto-meta">
      <span class="muted">${cliente ? escapeHtml(cliente.nome) : "cliente removido"}</span>
      <span class="dot-sep">·</span>
      <span class="muted prioridade-${p.prioridade}">${PRIORIDADE_LABEL[p.prioridade]}</span>
      <span class="dot-sep">·</span>
      <span class="muted">${dias === 0 ? "atualizado hoje" : `há ${dias}d`}</span>
    </div>
    <select data-projeto-id="${p.id}" class="status-select">
      ${STATUS.map((s) => `<option value="${s}" ${s === p.status ? "selected" : ""}>${STATUS_LABEL[s]}</option>`).join("")}
    </select>
    ${orcamento ? renderOrcamento(orcamento, mudancasEscopo) : ""}
    ${!orcamento || orcamento.status === "PERDIDO" ? renderFormOrcamento(p.id) : ""}
    ${renderLevantamento(p.id, itensLevantamento, candidatos, importando)}
  </li>`;
}

function renderLevantamento(
  projetoId: string,
  itens: ItemLevantamento[],
  candidatos: ItemCandidato[] | null,
  importando: boolean,
): string {
  const listaItens = itens.length
    ? `<ul class="levantamento-lista">${itens
        .map(
          (item) =>
            `<li>${escapeHtml(item.nome)} <span class="tag-origem-item">${item.origem === "pdf" ? "PDF" : "manual"}</span></li>`,
        )
        .join("")}</ul>`
    : '<p class="muted">Nenhum item de levantamento ainda.</p>';

  const revisao = candidatos
    ? `<div class="levantamento-revisao" data-projeto-id="${projetoId}">
        <p class="label">Encontrado no PDF — desmarque o que não for item real:</p>
        <div class="levantamento-candidatos">
          ${candidatos
            .map(
              (c, index) =>
                `<label class="levantamento-candidato"><input type="checkbox" data-index="${index}" ${c.provavelItem ? "checked" : ""} />${escapeHtml(c.texto)} <span class="muted">(pág. ${c.pagina})</span></label>`,
            )
            .join("")}
        </div>
        <div class="levantamento-revisao-acoes">
          <button type="button" class="btn-primary confirmar-levantamento" data-projeto-id="${projetoId}">Confirmar itens marcados</button>
          <button type="button" class="secondary-action cancelar-levantamento" data-projeto-id="${projetoId}">Cancelar</button>
        </div>
      </div>`
    : "";

  return `
    <div class="levantamento">
      <div class="levantamento-head">
        <span class="label">Levantamento</span>
        <label class="importar-pdf-label">
          ${importando ? "Lendo PDF..." : "+ Importar de PDF"}
          <input type="file" accept="application/pdf" class="importar-pdf-input" data-projeto-id="${projetoId}" ${importando ? "disabled" : ""} />
        </label>
      </div>
      ${listaItens}
      ${revisao}
    </div>`;
}

function renderOrcamento(orcamento: Orcamento, mudancasEscopo: MudancaEscopo[]): string {
  const liquido = valorLiquido(orcamento);
  const temCusto = orcamento.custoMateriaPrima !== null || orcamento.custoMaoDeObra !== null || orcamento.custoFixoRateado !== null;
  return `
    <div class="orcamento orcamento-${orcamento.status}">
      <div class="orcamento-valor">
        <span>${moeda.format(liquido)}</span>
        ${orcamento.descontoPercentual > 0 ? `<span class="muted orcamento-desconto">(−${orcamento.descontoPercentual}%)</span>` : ""}
      </div>
      <select data-orcamento-id="${orcamento.id}" class="status-orcamento-select">
        ${(Object.keys(STATUS_ORCAMENTO_LABEL) as StatusOrcamento[])
          .map((s) => `<option value="${s}" ${s === orcamento.status ? "selected" : ""}>${STATUS_ORCAMENTO_LABEL[s]}</option>`)
          .join("")}
      </select>
      ${
        temCusto
          ? `<p class="orcamento-custo muted">Custo: MP ${moeda.format(orcamento.custoMateriaPrima ?? 0)} + MO ${moeda.format(orcamento.custoMaoDeObra ?? 0)} + Fixo ${moeda.format(orcamento.custoFixoRateado ?? 0)} · Markup ${orcamento.markupPercentual ?? 0}%</p>`
          : ""
      }
      ${orcamento.status === "PERDIDO" && orcamento.motivoPerda ? `<p class="orcamento-motivo">Motivo: ${escapeHtml(orcamento.motivoPerda)}</p>` : ""}
      ${orcamento.status === "APROVADO" ? renderFechamento(orcamento, mudancasEscopo) : ""}
    </div>`;
}

// CP005 - fechamento do projeto: custo real x estimado, e log de mudanca
// de escopo. So aparece com orcamento APROVADO. Uma vez fechado
// (fechadoEm preenchido), vira so leitura - o dado real nao e editavel.
function renderFechamento(orcamento: Orcamento, mudancasEscopo: MudancaEscopo[]): string {
  const listaMudancas = mudancasEscopo.length
    ? `<ul class="mudancas-lista">${mudancasEscopo
        .map(
          (m) =>
            `<li><span class="tag-categoria-mudanca">${CATEGORIA_MUDANCA_LABEL[m.categoria]}</span>${m.descricao ? " — " + escapeHtml(m.descricao) : ""}</li>`,
        )
        .join("")}</ul>`
    : '<p class="muted">Nenhuma mudança de escopo registrada.</p>';

  const formMudanca = `
    <form class="form-mudanca-escopo" data-projeto-id="${orcamento.projetoId}">
      <select name="categoria">
        ${CATEGORIAS_MUDANCA_ESCOPO.map((c) => `<option value="${c}">${CATEGORIA_MUDANCA_LABEL[c]}</option>`).join("")}
      </select>
      <input name="descricao" placeholder="Descrição (opcional)" />
      <button type="submit" class="secondary-action">+ Mudança</button>
    </form>`;

  if (orcamento.fechadoEm === null) {
    return `
      <div class="fechamento">
        <p class="label">Fechamento do projeto</p>
        <form class="form-fechamento" data-orcamento-id="${orcamento.id}">
          <input name="custoReal" type="number" min="0" step="0.01" placeholder="Custo real total (R$)" required />
          <button type="submit" class="btn-primary">Registrar fechamento</button>
        </form>
        <p class="label">Mudanças de escopo durante o projeto</p>
        ${listaMudancas}
        ${formMudanca}
      </div>`;
  }

  const comparativo = compararFechamento(orcamento);
  return `
    <div class="fechamento fechamento-concluido">
      <p class="label">Fechamento do projeto — encerrado</p>
      ${
        comparativo
          ? `<p class="fechamento-comparativo">Estimado: ${moeda.format(comparativo.custoEstimado)} · Real: ${moeda.format(comparativo.custoReal)} · Diferença: <span class="${comparativo.diferenca > 0 ? "diferenca-negativa" : "diferenca-positiva"}">${comparativo.diferenca > 0 ? "+" : ""}${moeda.format(comparativo.diferenca)}</span> (${mudancasEscopo.length} mudança${mudancasEscopo.length === 1 ? "" : "s"} de escopo)</p>`
          : ""
      }
      ${listaMudancas}
    </div>`;
}

function renderFormOrcamento(projetoId: string): string {
  return `
    <form class="form-orcamento" data-projeto-id="${projetoId}">
      <input name="valor" type="number" min="0" step="0.01" placeholder="Valor (R$)" required />
      <input name="desconto" type="number" min="0" max="100" step="0.1" placeholder="Desconto %" />
      <input name="margem" type="number" min="0" max="100" step="0.1" placeholder="Margem %" />
      <input name="comissao" type="number" min="0" max="100" step="0.1" placeholder="Comissão %" />
      <details class="calculadora-custo">
        <summary>Calcular a partir do custo real (opcional)</summary>
        <input name="custoMp" type="number" min="0" step="0.01" placeholder="Matéria-prima (R$)" />
        <input name="custoMo" type="number" min="0" step="0.01" placeholder="Mão de obra (R$)" />
        <input name="custoFixo" type="number" min="0" step="0.01" placeholder="Custo fixo rateado (R$)" />
        <input name="markup" type="number" min="0" step="0.1" placeholder="Markup %" />
        <button type="button" class="secondary-action calcular-preco-sugerido" data-projeto-id="${projetoId}">Calcular sugestão de venda</button>
      </details>
      <button type="submit">+ Orçamento</button>
    </form>`;
}

// CP006 - compras e estoque. Dominio proprio, independente de projeto
// (ver ROADMAP.md) - "itens faltantes" e so quantidadeAtual abaixo de
// quantidadeMinima, ja refletido no painel de atencao via AtencaoEngine.
function renderEstoque(itens: ItemEstoque[], projetos: Projeto[]): string {
  return `
    <section class="painel" id="painel-estoque">
      <div class="painel-head">
        <h2 class="section-title">Compras e estoque</h2>
        <span class="contagem">${itens.length}</span>
      </div>
      <form id="form-item-estoque" class="form">
        <label class="field"><span>Nome do item</span><input name="nome" placeholder="Ex.: Dobradiça 35mm" required /></label>
        <div class="field-row">
          <label class="field"><span>Unidade</span><input name="unidade" placeholder="un, m, m², kg, chapa..." required /></label>
          <label class="field"><span>Quantidade mínima</span><input name="quantidadeMinima" type="number" min="0" step="0.01" placeholder="0" required /></label>
        </div>
        <button type="submit" class="btn-primary">+ Adicionar item de estoque</button>
      </form>
      <ul class="lista">
        ${itens.map((item) => renderItemEstoque(item, projetos)).join("") || '<li class="vazio">Nenhum item de estoque cadastrado ainda.</li>'}
      </ul>
    </section>`;
}

function renderItemEstoque(item: ItemEstoque, projetos: Projeto[]): string {
  const faltando = item.quantidadeAtual < item.quantidadeMinima;
  return `<li class="card-estoque ${faltando ? "card-estoque-faltando" : ""}">
    <div class="card-projeto-top">
      <b>${escapeHtml(item.nome)}</b>
      <span class="badge ${faltando ? "badge-ATRASADO" : "badge-CONCLUIDO"}">${item.quantidadeAtual} ${escapeHtml(item.unidade)}</span>
    </div>
    <div class="card-projeto-meta muted">Mínimo: ${item.quantidadeMinima} ${escapeHtml(item.unidade)}${faltando ? " · abaixo do mínimo" : ""}</div>
    <form class="form-movimento-estoque" data-item-estoque-id="${item.id}">
      <select name="tipo" class="movimento-tipo-select">
        <option value="ENTRADA">Entrada (compra)</option>
        <option value="SAIDA">Saída</option>
      </select>
      <input name="quantidade" type="number" min="0.01" step="0.01" placeholder="Qtd." required />
      <span class="campo-entrada">
        <input name="fornecedor" placeholder="Fornecedor" />
      </span>
      <span class="campo-entrada">
        <input name="precoUnitario" type="number" min="0.01" step="0.01" placeholder="Preço unitário (R$)" />
      </span>
      <span class="campo-saida">
        <select name="projetoId">
          <option value="">Selecione o projeto</option>
          ${projetos.map((p) => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join("")}
        </select>
      </span>
      <input name="motivo" placeholder="Motivo (opcional)" />
      <button type="submit" class="secondary-action">Registrar</button>
    </form>
  </li>`;
}

// CP007 - financeiro: vendido/custo só contam orçamento FECHADO
// (fechadoEm != null - Charles, 24/07/2026), fluxo de caixa por mês.
// Só relatório - sem formulário, o dado já vem do fechamento (CP005) e
// do estoque (CP006).
function renderFinanceiro(orcamentos: Orcamento[], movimentosEstoque: MovimentoEstoque[]): string {
  const vendido = valorTotalVendido(orcamentos);
  const custo = custoTotalReal(orcamentos, movimentosEstoque);
  const margem = vendido - custo;
  const fluxo = computeFluxoCaixa(orcamentos, movimentosEstoque);

  return `
    <section class="painel" id="painel-financeiro">
      <div class="painel-head">
        <h2 class="section-title">Financeiro</h2>
      </div>
      <div class="financeiro-stats">
        <div class="stat"><span class="stat-value stat-money">${moeda.format(vendido)}</span><span class="stat-label">vendido (projetos fechados)</span></div>
        <div class="stat"><span class="stat-value stat-money">${moeda.format(custo)}</span><span class="stat-label">custo real</span></div>
        <div class="stat stat-${margem >= 0 ? "ok" : "alert"}"><span class="stat-value stat-money">${moeda.format(margem)}</span><span class="stat-label">margem</span></div>
      </div>
      <p class="label">Fluxo de caixa por mês</p>
      ${
        fluxo.length === 0
          ? '<p class="muted">Nenhum projeto fechado nem compra registrada ainda.</p>'
          : `<table class="tabela-fluxo-caixa">
              <thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
              <tbody>
                ${fluxo
                  .map(
                    (ponto) => `<tr>
                      <td>${formatarPeriodo(ponto.periodo)}</td>
                      <td class="valor-positivo">${moeda.format(ponto.entradas)}</td>
                      <td class="valor-negativo">${moeda.format(ponto.saidas)}</td>
                      <td class="${ponto.saldo >= 0 ? "valor-positivo" : "valor-negativo"}">${moeda.format(ponto.saldo)}</td>
                    </tr>`,
                  )
                  .join("")}
              </tbody>
            </table>`
      }
    </section>`;
}

// CP008 - indicadores/KPIs. Escopo confirmado com Charles (24/07/2026):
// setor atrasando = por etapa de produção; ranking = responsável por
// concluídos; tempo médio = início (Projeto.criadoEm) ao fechamento
// (Orcamento.fechadoEm). Só relatório, sem formulário.
function renderIndicadores(projetos: Projeto[], orcamentos: Orcamento[], agora: number): string {
  const etapas = etapasAtrasadas(projetos, agora);
  const ranking = rankingResponsaveis(projetos);
  const tempoMedio = tempoMedioFechamentoDias(orcamentos, projetos);

  return `
    <section class="painel" id="painel-indicadores">
      <div class="painel-head">
        <h2 class="section-title">Indicadores</h2>
      </div>

      <p class="label">Projetos parados por etapa de produção</p>
      <ul class="lista-indicador">
        ${etapas
          .map(
            (item) => `<li class="item-indicador ${item.quantidadeParada > 0 ? "item-indicador-alerta" : ""}">
              <span>${ETAPA_LABEL[item.etapa]}</span>
              <span class="contagem">${item.quantidadeParada}</span>
            </li>`,
          )
          .join("")}
      </ul>

      <p class="label">Ranking — projetos concluídos por responsável</p>
      ${
        ranking.length === 0
          ? '<p class="muted">Nenhum projeto concluído ainda.</p>'
          : `<ul class="lista-indicador">
              ${ranking
                .map(
                  (item, index) => `<li class="item-indicador">
                    <span>${index + 1}º · ${escapeHtml(item.responsavel)}</span>
                    <span class="contagem">${item.concluidos}</span>
                  </li>`,
                )
                .join("")}
            </ul>`
      }

      <p class="label">Tempo médio do início ao fechamento</p>
      <p class="stat-value">${tempoMedio === null ? "—" : `${tempoMedio} dia${tempoMedio === 1 ? "" : "s"}`}</p>
    </section>`;
}

// CP006 - mostra fornecedor/preço só na ENTRADA (é uma compra) e o
// seletor de projeto só na SAÍDA (obrigatório - Charles, 24/07/2026).
function toggleCamposMovimento(select: HTMLSelectElement): void {
  const form = select.closest("form");
  if (!form) return;
  const ehEntrada = select.value === "ENTRADA";
  form.querySelectorAll<HTMLElement>(".campo-entrada").forEach((el) => {
    el.style.display = ehEntrada ? "" : "none";
  });
  form.querySelectorAll<HTMLElement>(".campo-saida").forEach((el) => {
    el.style.display = ehEntrada ? "none" : "";
  });
}

function clampPercentual(raw: FormDataEntryValue | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function parseCustoOpcional(raw: FormDataEntryValue | string | null): number | null {
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function initials(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeiras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return primeiras.join("") || "?";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
