# CP002 Mobi Gestor Comercial — Handoff — Claude Code

Branch: `checkpoint/cp-gestor-002-comercial` (baseada em `checkpoint/cp-gestor-001-foundation`)

## Contexto

Implementado durante trabalho autônomo noturno, autorizado por Charles antes
de dormir ("faça o máximo possível, prepare algo pra eu ver às 6:50"). Sem
push, sem merge, sem nada destrutivo — só commits locais em branch própria,
prontos pra revisão.

## Escopo implementado

- Orçamento vinculado a um Projeto: valor, desconto %, margem %, comissão %.
- Status do orçamento: Aberto → Negociando → Aprovado ou Perdido (com motivo
  obrigatório quando perdido).
- Valor líquido calculado (`valor * (1 - desconto/100)`), testado.
- KPI no topbar: soma do valor líquido de orçamentos Aberto+Negociando
  ("em negociação") — sai da conta quando aprovado ou perdido.

## Suposições que PRECISAM da sua revisão

Documentadas em detalhe em `apps/mobi-gestor/ROADMAP.md`, resumo:

1. Um orçamento por projeto (não múltiplas versões/propostas).
2. Margem e comissão são só campos capturados — nenhum cálculo real ainda
   (não existe dado de custo no sistema pra isso fazer sentido).
3. "Motivo da perda" usa `window.prompt()` nativo do navegador — feio mas
   funcional, precisa virar formulário de verdade depois.
4. Sem funil/conversão agregada.
5. Moeda fixa BRL.

Se qualquer uma dessas suposições estiver errada pro seu fluxo real, é
mudança pequena e isolada — não acho que compromete o resto.

## Validação

- Testes novos (`tests/comercial.test.ts`): 7/7.
- Total do módulo: 17/17.
- Regressão completa da raiz: 454/454 (49 arquivos) — era 447 antes desta
  branch, +7 daqui, nada quebrou.
- Testado ao vivo: criei cliente, projeto, orçamento de R$15.000 com 10% de
  desconto (confirmei R$13.500 calculado certo), mudei status pra Aprovado,
  confirmei que o KPI "em negociação" saiu de R$13.500 pra R$0. Dados de
  teste limpos do localStorage depois.

## Status

READY_FOR_TECHNICAL_REVIEW. Aguardando você acordar para revisar as
suposições da seção acima antes de qualquer freeze.
