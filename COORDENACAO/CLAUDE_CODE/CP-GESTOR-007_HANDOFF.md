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

## Suposições que PRECISAM da sua revisão

1. **"Vendido" só conta projeto fechado**, não aprovado — se você
   queria ver o valor assim que aprova (antes de fechar), esse número
   vai ficar menor/atrasado em relação ao que está em negociação (que
   já aparece no topbar). Confirmar se faz sentido pro seu fluxo real.
2. **Custo real não soma compras de estoque separadamente** — só usa o
   número que você digita no fechamento do projeto (CP005). Se na
   prática você não inclui as compras de estoque nesse número manual,
   o "Custo real" do CP007 vai ficar subestimado. Vale confirmar como
   você preenche o custo real hoje.
3. **Sem saldo cumulativo** — cada mês mostra só o próprio saldo, não
   o acumulado desde o início. Se precisar ver "quanto sobrou no total
   até agora", é extensão pequena (soma progressiva), não implementada
   ainda.
4. Custos fora de projeto (aluguel, salário fixo da empresa) não
   existem no sistema — o "Custo real" e o fluxo de caixa só refletem
   o que passa por projeto/estoque.

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
