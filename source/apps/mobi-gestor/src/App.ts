import { computeAtencao } from "./AtencaoEngine";
import { ClienteRepository } from "./ClienteRepository";
import type { Orcamento, OrigemLead, Prioridade, StatusOrcamento, StatusProjeto } from "./GestorTypes";
import { valorLiquido } from "./GestorTypes";
import { OrcamentoRepository } from "./OrcamentoRepository";
import { ProjetoRepository } from "./ProjetoRepository";

const ORIGENS: OrigemLead[] = ["whatsapp", "instagram", "site", "indicacao", "telefone", "visita"];
const STATUS: StatusProjeto[] = ["NOVO", "LEVANTAMENTO", "ORCAMENTO", "PRODUCAO", "MONTAGEM", "CONCLUIDO", "ATRASADO", "PARADO"];
const PRIORIDADES: Prioridade[] = ["BAIXA", "MEDIA", "ALTA"];

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

const STATUS_ORCAMENTO_LABEL: Record<StatusOrcamento, string> = {
  ABERTO: "Aberto",
  NEGOCIANDO: "Negociando",
  APROVADO: "Aprovado",
  PERDIDO: "Perdido",
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export class App {
  private readonly clientes: ClienteRepository;
  private readonly projetos: ProjetoRepository;
  private readonly orcamentos: OrcamentoRepository;

  constructor(private readonly root: HTMLElement) {
    this.clientes = new ClienteRepository(window.localStorage);
    this.projetos = new ProjetoRepository(window.localStorage);
    this.orcamentos = new OrcamentoRepository(window.localStorage);
  }

  mount(): void {
    this.render();
  }

  private render(): void {
    const clientes = this.clientes.list();
    const projetos = this.projetos.list();
    const orcamentos = this.orcamentos.list();
    const atencao = computeAtencao(projetos, Date.now());
    const agora = Date.now();

    const emNegociacao = orcamentos
      .filter((o) => o.status === "ABERTO" || o.status === "NEGOCIANDO")
      .reduce((soma, o) => soma + valorLiquido(o), 0);

    this.root.innerHTML = `
      <div class="gestor">
        <header class="topbar">
          <div class="brand">
            <span class="brand-mark">MG</span>
            <div>
              <h1>Mobi Gestor</h1>
              <p class="eyebrow">Painel do dia — CP002</p>
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
              ${projetos
                .map((p) => {
                  const cliente = clientes.find((c) => c.id === p.clienteId);
                  const dias = Math.max(0, Math.floor((agora - p.atualizadoEm) / 86400000));
                  const orcamento = orcamentos.find((o) => o.projetoId === p.id) ?? null;
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
                    ${orcamento ? renderOrcamento(orcamento) : ""}
                    ${!orcamento || orcamento.status === "PERDIDO" ? renderFormOrcamento(p.id) : ""}
                  </li>`;
                })
                .join("") || '<li class="vazio">Nenhum projeto cadastrado ainda.</li>'}
            </ul>
          </section>
        </div>
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
        this.orcamentos.add({ projetoId, valor, descontoPercentual, margemPercentual, comissaoPercentual }, Date.now());
        this.render();
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
  }
}

function renderOrcamento(orcamento: Orcamento): string {
  const liquido = valorLiquido(orcamento);
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
      ${orcamento.status === "PERDIDO" && orcamento.motivoPerda ? `<p class="orcamento-motivo">Motivo: ${escapeHtml(orcamento.motivoPerda)}</p>` : ""}
    </div>`;
}

function renderFormOrcamento(projetoId: string): string {
  return `
    <form class="form-orcamento" data-projeto-id="${projetoId}">
      <input name="valor" type="number" min="0" step="0.01" placeholder="Valor (R$)" required />
      <input name="desconto" type="number" min="0" max="100" step="0.1" placeholder="Desconto %" />
      <input name="margem" type="number" min="0" max="100" step="0.1" placeholder="Margem %" />
      <input name="comissao" type="number" min="0" max="100" step="0.1" placeholder="Comissão %" />
      <button type="submit">+ Orçamento</button>
    </form>`;
}

function clampPercentual(raw: FormDataEntryValue | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
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
