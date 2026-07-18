# 2026-07-18 — Claude Empresa — Projeto Cassio, pipeline de Relatório de Conhecimento

Autor: Claude Empresa
Data: 2026-07-18

## Resumo

Charles pediu uma função nova, fora do Origin/Copilot: comparar uma pasta de
referência (antes) com uma pasta de execução real (depois) e gerar
relatórios de conhecimento, pra depois ele mesmo aplicar filtros do que um
líder de marcenaria precisa saber pra produção. Primeiro caso real: projeto
**Cassio Fernandes**, uma casa completa de 2 pavimentos (não um único
ambiente como os projetos anteriores).

Isso não é execução Origin nem trabalho de plataforma — é auditoria de
projeto de cliente real. Registro aqui só o resumo, pela relação de método
com o resto do protocolo de coordenação (mesma disciplina de "não confirmar
sem fonte real" já usada nas auditorias de Origin Eyes).

## O que foi feito

1. **Relatório 01 (ANTES)**: leitura de 5 PDFs do arquiteto/levantamento de
   campo (47 páginas) — casa de 2 pavimentos, módulos M1-M9 por zona.
2. **Relatório 02 (DEPOIS)**: pasta `FINAL/` com 37 PDFs (3.031 páginas) +
   G-code. A maior parte (etiquetas de peça, retalho, listas de compra) é
   texto nativo real extraível — processado com parser Python, não leitura
   visual. Achado: **2.512 peças reais cortadas**, **173 módulos**, **57
   retalhos catalogados**.
3. **Relatório de Conhecimento**: cruzamento ANTES x DEPOIS, PDF final.
4. **Relatório Líder de Marcenaria**: filtro próprio (Charles pediu que eu
   decidisse o corte) — só o que serve pra executar, sem linguagem de
   auditoria.
5. **Relatório de Erros e Inconsistências**: 8 achados reais, com
   severidade. Destaque: ferragem Blum aparece 1 única vez no projeto todo
   (2 unidades, dentro de um lote de 112 dobradiças HD) — sem dado suficiente
   pra saber qual módulo recebe, sinalizado como pendência de confirmação.

## Método (mesma disciplina do resto do protocolo)

Nenhum número em nenhum relatório veio de estimativa visual quando havia
fonte de texto real disponível (etiqueta de peça/retalho gerada pelo
próprio sistema de produção). Onde só havia desenho vetorial sem
mapeamento de texto (fonte customizada, extração ilegível), sinalizei como
pendente em vez de estimar por leitura visual aproximada.

## Sem relação direta com código da plataforma

Nada aqui pede hotfix, muda schema `mobi-origin-input-v0` ou toca em
`source/`. Registro só pra manter o "log comum" do protocolo coerente —
qualquer frente que abrir este repo sabe que essa branch existiu e o que
cobria.
