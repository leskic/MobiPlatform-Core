import { computeAtencao } from "./AtencaoEngine";
import { ClienteRepository } from "./ClienteRepository";
import type { OrigemLead, Prioridade, StatusProjeto } from "./GestorTypes";
import { ProjetoRepository } from "./ProjetoRepository";

const ORIGENS: OrigemLead[] = ["whatsapp", "instagram", "site", "indicacao", "telefone", "visita"];
const STATUS: StatusProjeto[] = ["NOVO", "LEVANTAMENTO", "ORCAMENTO", "PRODUCAO", "MONTAGEM", "CONCLUIDO", "ATRASADO", "PARADO"];
const PRIORIDADES: Prioridade[] = ["BAIXA", "MEDIA", "ALTA"];

export class App {
  private readonly clientes: ClienteRepository;
  private readonly projetos: ProjetoRepository;

  constructor(private readonly root: HTMLElement) {
    this.clientes = new ClienteRepository(window.localStorage);
    this.projetos = new ProjetoRepository(window.localStorage);
  }

  mount(): void {
    this.render();
  }

  private render(): void {
    const clientes = this.clientes.list();
    const projetos = this.projetos.list();
    const atencao = computeAtencao(projetos, Date.now());

    this.root.innerHTML = `
      <div class="gestor">
        <header class="gestor-header">
          <h1>Mobi Gestor</h1>
          <p class="subtitle">O que precisa da sua atenção agora</p>
        </header>

        <section class="atencao-panel" id="atencao-panel">
          ${
            atencao.length === 0
              ? '<p class="atencao-vazia">Nenhum projeto atrasado ou parado.</p>'
              : atencao
                  .map(
                    (item) => `
                <div class="atencao-item atencao-${item.severidade}">
                  <span class="atencao-nome">${escapeHtml(item.projetoNome)}</span>
                  <span class="atencao-motivo">${escapeHtml(item.motivo)}</span>
                </div>`,
                  )
                  .join("")
          }
        </section>

        <div class="columns">
          <section class="painel" id="painel-clientes">
            <h2>Clientes <span class="contagem">${clientes.length}</span></h2>
            <form id="form-cliente" class="form">
              <input name="nome" placeholder="Nome" required />
              <input name="contato" placeholder="Contato (telefone/e-mail)" required />
              <select name="origem">${ORIGENS.map((o) => `<option value="${o}">${o}</option>`).join("")}</select>
              <input name="interesse" placeholder="Interesse (ex: cozinha planejada)" />
              <input name="responsavel" placeholder="Responsável" required />
              <button type="submit">Adicionar cliente</button>
            </form>
            <ul class="lista">
              ${clientes
                .map(
                  (c) => `<li><b>${escapeHtml(c.nome)}</b> — ${escapeHtml(c.contato)} <span class="tag">${c.origem}</span></li>`,
                )
                .join("") || '<li class="vazio">Nenhum cliente cadastrado.</li>'}
            </ul>
          </section>

          <section class="painel" id="painel-projetos">
            <h2>Projetos <span class="contagem">${projetos.length}</span></h2>
            <form id="form-projeto" class="form">
              <select name="clienteId" required>
                <option value="" disabled selected>Cliente</option>
                ${clientes.map((c) => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join("")}
              </select>
              <input name="nome" placeholder="Nome do projeto" required />
              <select name="status">${STATUS.map((s) => `<option value="${s}">${s}</option>`).join("")}</select>
              <select name="prioridade">${PRIORIDADES.map((p) => `<option value="${p}">${p}</option>`).join("")}</select>
              <input name="responsavel" placeholder="Responsável" required />
              <button type="submit" ${clientes.length === 0 ? "disabled" : ""}>Adicionar projeto</button>
            </form>
            <ul class="lista">
              ${projetos
                .map((p) => {
                  const cliente = clientes.find((c) => c.id === p.clienteId);
                  return `<li>
                    <b>${escapeHtml(p.nome)}</b>
                    <span class="tag status-${p.status}">${p.status}</span>
                    <span class="tag prioridade-${p.prioridade}">${p.prioridade}</span>
                    <span class="cliente-ref">${cliente ? escapeHtml(cliente.nome) : "cliente removido"}</span>
                    <select data-projeto-id="${p.id}" class="status-select">
                      ${STATUS.map((s) => `<option value="${s}" ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}
                    </select>
                  </li>`;
                })
                .join("") || '<li class="vazio">Nenhum projeto cadastrado.</li>'}
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
      this.clientes.add(
        {
          nome: String(data.get("nome") ?? ""),
          contato: String(data.get("contato") ?? ""),
          origem: (data.get("origem") as OrigemLead) ?? "site",
          interesse: String(data.get("interesse") ?? ""),
          responsavel: String(data.get("responsavel") ?? ""),
        },
        Date.now(),
      );
      this.render();
    });

    const formProjeto = this.root.querySelector<HTMLFormElement>("#form-projeto");
    formProjeto?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(formProjeto);
      this.projetos.add(
        {
          clienteId: String(data.get("clienteId") ?? ""),
          nome: String(data.get("nome") ?? ""),
          status: (data.get("status") as StatusProjeto) ?? "NOVO",
          prioridade: (data.get("prioridade") as Prioridade) ?? "MEDIA",
          responsavel: String(data.get("responsavel") ?? ""),
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
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
