import { describe, expect, it, beforeEach } from "vitest";
import { computeAtencao } from "../src/AtencaoEngine";
import { ClienteRepository } from "../src/ClienteRepository";
import { ProjetoRepository } from "../src/ProjetoRepository";
import type { Projeto } from "../src/GestorTypes";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function projeto(overrides: Partial<Projeto>): Projeto {
  return {
    id: "proj-1",
    clienteId: "cli-1",
    nome: "Cozinha Torres",
    status: "PRODUCAO",
    prioridade: "MEDIA",
    responsavel: "Charles",
    criadoEm: 0,
    atualizadoEm: 0,
    ...overrides,
  };
}

describe("Mobi Gestor CP001 foundation", () => {
  describe("AtencaoEngine", () => {
    it("flags a project marked ATRASADO as error severity", () => {
      const agora = 1_000_000;
      const itens = computeAtencao([projeto({ status: "ATRASADO", atualizadoEm: agora })], agora);
      expect(itens).toEqual([{ projetoId: "proj-1", projetoNome: "Cozinha Torres", motivo: "Marcado como atrasado", severidade: "error" }]);
    });

    it("flags a project untouched for 7+ days as warning severity", () => {
      const agora = Date.UTC(2026, 6, 16);
      const oitoDiasAtras = agora - 8 * 24 * 60 * 60 * 1000;
      const itens = computeAtencao([projeto({ status: "PRODUCAO", atualizadoEm: oitoDiasAtras })], agora);
      expect(itens).toHaveLength(1);
      expect(itens[0]).toMatchObject({ severidade: "warning" });
    });

    it("does not flag a recently updated project", () => {
      const agora = Date.UTC(2026, 6, 16);
      const itens = computeAtencao([projeto({ status: "PRODUCAO", atualizadoEm: agora })], agora);
      expect(itens).toHaveLength(0);
    });

    it("never flags a CONCLUIDO project regardless of last update", () => {
      const agora = Date.UTC(2026, 6, 16);
      const umAnoAtras = agora - 365 * 24 * 60 * 60 * 1000;
      const itens = computeAtencao([projeto({ status: "CONCLUIDO", atualizadoEm: umAnoAtras })], agora);
      expect(itens).toHaveLength(0);
    });

    it("sorts errors before warnings", () => {
      const agora = Date.UTC(2026, 6, 16);
      const oitoDiasAtras = agora - 8 * 24 * 60 * 60 * 1000;
      const itens = computeAtencao(
        [
          projeto({ id: "proj-warn", status: "PRODUCAO", atualizadoEm: oitoDiasAtras }),
          projeto({ id: "proj-err", status: "ATRASADO", atualizadoEm: agora }),
        ],
        agora,
      );
      expect(itens.map((item) => item.projetoId)).toEqual(["proj-err", "proj-warn"]);
    });
  });

  describe("ClienteRepository", () => {
    let storage: MemoryStorage;
    beforeEach(() => { storage = new MemoryStorage(); });

    it("adds a client and lists newest first", () => {
      const repo = new ClienteRepository(storage);
      repo.add({ nome: "Maria", contato: "11999990000", origem: "whatsapp", interesse: "cozinha", responsavel: "Charles" }, 1000);
      repo.add({ nome: "João", contato: "11988880000", origem: "site", interesse: "closet", responsavel: "Charles" }, 2000);
      const lista = repo.list();
      expect(lista.map((c) => c.nome)).toEqual(["João", "Maria"]);
    });

    it("persists across repository instances sharing the same storage", () => {
      new ClienteRepository(storage).add({ nome: "Ana", contato: "x", origem: "instagram", interesse: "", responsavel: "y" }, 500);
      const reloaded = new ClienteRepository(storage).list();
      expect(reloaded).toHaveLength(1);
      expect(reloaded[0]?.nome).toBe("Ana");
    });
  });

  describe("ProjetoRepository", () => {
    let storage: MemoryStorage;
    beforeEach(() => { storage = new MemoryStorage(); });

    it("adds a project linked to a client", () => {
      const repo = new ProjetoRepository(storage);
      const criado = repo.add({ clienteId: "cli-1", nome: "Cozinha", status: "NOVO", prioridade: "ALTA", responsavel: "Charles" }, 1000);
      expect(criado.status).toBe("NOVO");
      expect(repo.listPorCliente("cli-1")).toHaveLength(1);
    });

    it("updates status and bumps atualizadoEm", () => {
      const repo = new ProjetoRepository(storage);
      const criado = repo.add({ clienteId: "cli-1", nome: "Cozinha", status: "NOVO", prioridade: "ALTA", responsavel: "Charles" }, 1000);
      const atualizado = repo.atualizarStatus(criado.id, "PRODUCAO", 5000);
      expect(atualizado?.status).toBe("PRODUCAO");
      expect(atualizado?.atualizadoEm).toBe(5000);
    });

    it("returns null when updating a project that does not exist", () => {
      const repo = new ProjetoRepository(storage);
      expect(repo.atualizarStatus("nao-existe", "PRODUCAO", 5000)).toBeNull();
    });
  });
});
