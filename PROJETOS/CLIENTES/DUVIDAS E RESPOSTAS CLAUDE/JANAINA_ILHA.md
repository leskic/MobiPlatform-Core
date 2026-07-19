# Janaína Martinez — Ilha (JN24001)

Fonte: `ORIGIN_PROJECT_FILE_V1_ILHA_JN24001.json` (`C:\MobiAudit\JANAINA_COZINHA\` e `E:\cofre\01_JANAINA\`).

---

## H1 — Altura da Ilha (845 ou 855mm?)

**Dúvida (Claude Empresa):** o desenho a mão da Ilha (Vista Frontal) tem
duas leituras de altura interna com 11mm de diferença — 845mm e 855mm.
Qual usar?

**Resposta (Charles):** "altura interna 845 ou 855, qualquer uma delas
vai ter que usar pé de plástico para nivelar e depois fazer acabamento,
pode escolher qualquer uma." Mesma regra já fixada antes pra Ilha da
Taciana — o pé regulável absorve a diferença de nivelamento, então a
escolha entre as duas leituras não muda o resultado final.

**Nota de processo:** Charles apontou que já tinha respondido essa mesma
lógica antes e a resposta deveria ter sido aplicada proativamente, sem
precisar perguntar de novo — regra geral: "levantamento de campo +
pé regulável resolve conflito de altura", já usada nesse mesmo formato
na Ilha da Taciana.

**Status:** RESOLVED. Altura = **845mm** (menor das duas leituras).
Pendência `ILHA_ALTURA_001` fechada.

---

## H2 — Distância da Ilha até a bancada da cozinha

**Dúvida (Claude Empresa):** o valor "889" aparece no desenho a mão da
Ilha sem rótulo claro — é a distância até a bancada da cozinha, até a
parede, ou outra referência?

**Resposta (Charles):** "889 ali é a distância da pedra da ilha até a
pedra da cozinha" — confirmado diretamente em texto, sem ambiguidade.

**Status:** CONFIRMED. `gap_ilha_bancada_cozinha_mm: 889`.

---

## Pendências ainda abertas (não incluídas acima por não estarem respondidas)

- Orientação/eixo exato da Ilha na Parede A (centralizada? deslocada?).
- Ficha técnica dos 3 eletros da Ilha (cooktop, forno, adega/cervejeira).
- Pontos elétricos (`PONTO_1`/`PONTO_2`) — pares 855/669 e 844/672 podem
  ser a mesma leitura de altura reinterpretada (ver H1) em vez de cotas
  de ponto elétrico distintas, mas isso ainda não foi confirmado
  explicitamente com o Charles — não promovido a CONFIRMED.
- Cotas internas miúdas do CAD (`internal_divisions_detailed_cad`).
