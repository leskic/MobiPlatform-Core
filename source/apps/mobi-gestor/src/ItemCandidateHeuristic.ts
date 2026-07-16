export interface LinhaExtraida {
  pagina: number;
  texto: string;
  y: number;
}

export interface ItemCandidato {
  texto: string;
  pagina: number;
  provavelItem: boolean;
}

// Palavras que aparecem em todo cabeçalho/timbre de prancha — nunca são
// nome de item de marcenaria, servem só pra reduzir ruido no candidato.
const RUIDO = new Set([
  "ETAPA", "ANTE", "PROJETO", "PROJETISTA", "AUTOR", "CONTATO", "ESCALA", "INDICADA", "DATA",
  "REVISAO", "REVISÃO", "CLIENTE", "REV", "CONTEUDO", "CONTEÚDO", "PLANTA",
  "BAIXA", "OBS", "TODAS", "AS", "MEDIDA", "MEDIDAS", "DEVERAO", "DEVERÃO",
  "SER", "CONFERIDAS", "PELO", "EXECUTOR", "IN", "LOCO", "PERSPECTIVA",
]);

export function candidatosDeItens(linhas: readonly LinhaExtraida[]): ItemCandidato[] {
  const vistos = new Set<string>();
  const candidatos: ItemCandidato[] = [];

  for (const linha of linhas) {
    const texto = linha.texto.trim();
    if (texto.length < 3 || texto.length > 60) continue;
    if (/^\d+([.,]\d+)?$/.test(texto)) continue;

    const chaveDedup = texto.toUpperCase();
    if (vistos.has(chaveDedup)) continue;

    const palavras = texto.split(/\s+/).filter(Boolean);
    const palavrasRuido = palavras.filter((p) => RUIDO.has(p.toUpperCase())).length;
    const maiuscula = palavras.filter((p) => p === p.toUpperCase() && /[A-ZÀ-Ú]/.test(p)).length;

    const provavelItem =
      palavras.length >= 1 &&
      palavras.length <= 6 &&
      palavrasRuido === 0 &&
      maiuscula / palavras.length >= 0.6 &&
      !/^\d/.test(texto);

    vistos.add(chaveDedup);
    candidatos.push({ texto, pagina: linha.pagina, provavelItem });
  }

  return candidatos;
}
