import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Mobi Copilot CP001 SketchUp plugin", () => {
  it("registers a SketchUp extension loader", () => {
    const loader = read("mobi_copilot.rb");

    expect(loader).toContain("SketchupExtension.new");
    expect(loader).toContain("Mobi Copilot");
    expect(loader).toContain("0.1.0-cp001");
  });

  it("creates a navigable dashboard panel", () => {
    const html = read("mobi_copilot/ui/dashboard.html");

    expect(html).toContain("Mobi Copilot");
    expect(html).toContain("Projeto");
    expect(html).toContain("Estatisticas");
    expect(html).toContain("Selecao");
    expect(html).toContain("Ultimos Eventos");
    for (const label of ["Projeto", "Ambientes", "Componentes", "Pecas", "Estatisticas", "Relatorio", "Snapshot", "Alertas", "Diagnostico"]) {
      expect(html).toContain(label);
    }
  });

  it("collects project, statistics, selection, and session data", () => {
    const runtime = read("mobi_copilot/runtime_state.rb");

    expect(runtime).toContain("def project");
    expect(runtime).toContain("def statistics");
    expect(runtime).toContain("def selection");
    expect(runtime).toContain("durationSeconds");
    expect(runtime).toContain("components");
    expect(runtime).toContain("materials");
  });

  it("installs quiet observers for model and selection events", () => {
    const observers = read("mobi_copilot/observers.rb");

    expect(observers).toContain("Sketchup::AppObserver");
    expect(observers).toContain("Sketchup::ModelObserver");
    expect(observers).toContain("Sketchup::SelectionObserver");
    expect(observers).toContain("Projeto salvo");
    expect(observers).toContain("Selecao alterada");
  });

  it("does not include AI, chat, server, or external integration code", () => {
    const files = [
      read("mobi_copilot.rb"),
      read("mobi_copilot/main.rb"),
      read("mobi_copilot/panel.rb"),
      read("mobi_copilot/runtime_state.rb"),
      read("mobi_copilot/observers.rb"),
      read("mobi_copilot/ui/dashboard.html"),
    ].join("\n");

    expect(files).not.toMatch(/\b(OpenAI|Gemini|chat|server|Dinabox|database)\b/i);
  });
});
