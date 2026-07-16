import { describe, expect, it } from "vitest";
import { candidatosDeItens, type LinhaExtraida } from "../src/ItemCandidateHeuristic";

function linha(texto: string, pagina = 1, y = 100): LinhaExtraida {
  return { texto, pagina, y };
}

describe("PdfImporter.candidatosDeItens", () => {
  it("marks real furniture item names as likely candidates", () => {
    const linhas = [linha("CRISTALEIRA"), linha("BUFFET"), linha("ARMARIO COZINHA"), linha("ILHA")];
    const candidatos = candidatosDeItens(linhas);
    expect(candidatos.filter((c) => c.provavelItem).map((c) => c.texto)).toEqual([
      "CRISTALEIRA",
      "BUFFET",
      "ARMARIO COZINHA",
      "ILHA",
    ]);
  });

  it("excludes known title-block noise words even in isolation", () => {
    const linhas = [linha("ETAPA"), linha("PROJETISTA"), linha("CLIENTE"), linha("DATA")];
    const candidatos = candidatosDeItens(linhas);
    expect(candidatos.every((c) => !c.provavelItem)).toBe(true);
  });

  it("excludes pure numeric lines (dimension values, not item names)", () => {
    const linhas = [linha("2250"), linha("803"), linha("400.5")];
    const candidatos = candidatosDeItens(linhas);
    expect(candidatos).toHaveLength(0);
  });

  it("deduplicates repeated lines (same header repeats on every page)", () => {
    const linhas = [linha("CRISTALEIRA", 1), linha("CRISTALEIRA", 2), linha("cristaleira", 3)];
    const candidatos = candidatosDeItens(linhas);
    expect(candidatos).toHaveLength(1);
  });

  it("does not flag lowercase or mixed-case prose as a likely item", () => {
    const linhas = [linha("Todas as medidas deverao ser conferidas pelo executor")];
    const candidatos = candidatosDeItens(linhas);
    expect(candidatos[0]?.provavelItem).toBe(false);
  });

  it("rejects lines that are too short or too long to be an item name", () => {
    const linhas = [linha("A"), linha("X".repeat(70))];
    const candidatos = candidatosDeItens(linhas);
    expect(candidatos).toHaveLength(0);
  });
});
