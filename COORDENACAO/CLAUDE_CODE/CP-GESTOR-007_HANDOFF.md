# CP007 Mobi Gestor Financeiro — Handoff — Claude Code

Branch: `checkpoint/cp-gestor-007-financeiro` (baseada em
`checkpoint/cp-gestor-006-compras-estoque`, working tree limpo)

## Contexto

CP006 fechado e revisado. Charles pediu pra seguir direto pro próximo
item do roadmap. Antes de implementar, perguntei os 3 pontos que
mudariam o cálculo (ponto de reconhecimento de "vendido", datas do
fluxo de caixa, fonte do custo pra não contar 2x) — decisões abaixo.

## Escopo implementado

- `FinanceiroEngine.ts` (funções puras, mesmo padrão do
  `AtencaoEngine.ts`): `valorTotalVendido`, `custoTotalReal`,
  `computeFluxoCaixa`, `formatarPeriodo`.
- Vendido/custo só contam orçamento **fechado** (`fechadoEm != null`,
  CP005) — não só aprovado.
- Custo real usa só `custoRealTotal` do fechamento — compras de
  estoque **não** somam de novo aqui (evita duplicar).
- Fluxo de caixa por mês: entrada = valor líquido no mês do fechamento;
  saída = compras de estoque (`ENTRADA`) no mês da compra. Saldo por
  mês, não cumulativo.
- Nova seção "Financeiro" na UI: 3 cards + tabela do fluxo de caixa.
  Só leitura, sem formulário novo.

## Suposições — todas revisadas com Charles (24/07/2026, mesmo dia)

1. ~~"Vendido" só conta projeto fechado~~ — **confirmado, mantido como
   estava**. Não conta na aprovação, só no fechamento formal.
2. ~~Custo real não soma compras de estoque separadamente~~ —
   **corrigido**: Charles confirmou que o valor digitado no fechamento
   **não inclui** compras de estoque. `custoTotalReal(orcamentos,
   movimentos)` agora soma os dois — `custoRealTotal` dos fechamentos +
   `quantidade × precoUnitario` de toda compra (`ENTRADA`) registrada.
   Testado ao vivo: R$4.000 (fechamento) + R$1.200 (compra) = R$5.200
   no card de Custo Real (a leitura ao vivo mostrou o dobro porque o
   `localStorage` tinha dado do teste anterior acumulado — matemática
   conferida e bate: 2×4000 + 2×1200 = 10.400).
3. ~~Sem saldo cumulativo~~ — **confirmado, mantido como estava**. Não
   precisa por enquanto.
4. Custos fora de projeto (aluguel, salário fixo da empresa) — não
   revisado, segue fora de escopo como estava.

## Validação

- Testes novos (`tests/financeiro.test.ts`): 12/12.
- Suite completa do app: 73/73 (nenhuma regressão).
- `tsc --noEmit`: limpo (strict).
- `npm run build`: limpo.
- **Testado ao vivo no navegador**, fluxo completo do zero
  (`localStorage.clear()`): criei cliente → projeto → orçamento
  R$10.000 (10% desconto) → aprovei → fechei com custo real R$4.000 —
  confirmei Vendido R$9.000, Custo R$4.000, Margem R$5.000, fluxo de
  caixa do mês (entrada R$9.000/saída R$0). Depois cadastrei item de
  estoque MDF e registrei entrada de 4 chapas a R$300 — confirmei saída
  do fluxo subir pra R$1.200 no mesmo mês (saldo R$7.800) **sem**
  duplicar no card de Custo real (continuou R$4.000). Servidor parado
  depois do teste.

## Status

READY_FOR_TECHNICAL_REVIEW. Aguardando sua revisão das 4 suposições
acima antes de qualquer freeze ou avanço pro CP008.
