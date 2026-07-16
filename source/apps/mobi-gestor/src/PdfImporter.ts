import * as pdfjsLib from "pdfjs-dist";
// eslint-disable-next-line import/no-unresolved
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { LinhaExtraida } from "./ItemCandidateHeuristic";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type { LinhaExtraida, ItemCandidato } from "./ItemCandidateHeuristic";
export { candidatosDeItens } from "./ItemCandidateHeuristic";

export async function extrairLinhas(arrayBuffer: ArrayBuffer): Promise<LinhaExtraida[]> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const linhas: LinhaExtraida[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const porLinha = new Map<number, { x: number; texto: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] as number);
      const x = item.transform[4] as number;
      const bucket = [...porLinha.keys()].find((existente) => Math.abs(existente - y) <= 2);
      const chave = bucket ?? y;
      if (!porLinha.has(chave)) porLinha.set(chave, []);
      porLinha.get(chave)!.push({ x, texto: item.str });
    }

    const linhasOrdenadas = [...porLinha.entries()].sort((a, b) => b[0] - a[0]);
    for (const [y, partes] of linhasOrdenadas) {
      const texto = partes
        .sort((a, b) => a.x - b.x)
        .map((p) => p.texto)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (texto) linhas.push({ pagina: pageNum, texto, y });
    }
  }

  return linhas;
}
