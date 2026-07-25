# CP006 Mobi Gestor Compras e Estoque — Handoff — Claude Code

Branch: `checkpoint/cp-gestor-006-compras-estoque` (baseada em
`checkpoint/coordenacao-testes-resultados`, working tree limpo antes de
começar)

## Contexto

CP001-CP005 homologados por Charles (roteiro de teste humano concluído).
Ele confirmou explicitamente pra dar sequência no roadmap; CP006 era o
próximo item não iniciado. Antes de implementar, perguntei diretamente
qual deveria ser a base de "itens faltantes" (estoque próprio com
mínimo, vs. vínculo com `ItemLevantamento` do projeto) — Charles
escolheu **estoque próprio, com quantidade mínima**.

## Escopo implementado

- `ItemEstoque`: nome, unidade, quantidade atual (começa em 0),
  quantidade mínima.
- `MovimentoEstoque`: log de ENTRADA/SAÍDA, quantidade sempre positiva,
  motivo livre. ENTRADA exige `fornecedor` + `precoUnitario` (compra).
  SAÍDA exige `projetoId` (rastreio obrigatório, sem afetar custo/
  orçamento).
- `ItemEstoqueRepository.registrarMovimento` atualiza a quantidade e
  grava o movimento numa única operação; rejeitado (sem alterar nada)
  quando: quantidade ≤ 0, SAÍDA deixaria negativo, SAÍDA sem projeto,
  ou ENTRADA sem fornecedor/preço válido — mesmo idioma de guarda do
  `OrcamentoRepository.registrarFechamento`.
- `AtencaoEngine.computeAtencao` ganhou terceiro parâmetro opcional
  (`itensEstoque`) — item abaixo do mínimo vira item de atenção
  `warning` no mesmo painel já existente.
- Nova seção "Compras e estoque" na UI: cadastro de item + formulário
  de entrada/saída por item.

## Suposições — todas revisadas com Charles (24/07/2026)

1. ~~Estoque é global, um depósito só~~ — **confirmado e refinado**:
   ferragens usam 1 item compartilhado (estoque global, como
   construído). MDF é por cliente — não muda o código, é convenção de
   cadastro: um `ItemEstoque` por combinação material+cliente (ex.:
   "MDF Branco 15mm — Torres"). Documentado em `ROADMAP.md`.
2. ~~Sem fornecedor nem preço de compra~~ — **corrigido**: Charles
   pediu pra adicionar. `MovimentoEstoque` ganhou `fornecedor` e
   `precoUnitario`, **obrigatórios em toda ENTRADA** (é uma compra,
   precisa saber de quem e por quanto) — `registrarMovimento` rejeita
   entrada sem os dois preenchidos (fornecedor não-vazio, preço > 0).
   Testado ao vivo: entrada sem fornecedor foi bloqueada com alerta
   claro, quantidade não mudou.
3. Não vinculado a `ItemLevantamento`/BOM do projeto ainda — **mantido
   como estava**, Charles não pediu mudança aqui.
4. ~~Movimento de SAÍDA vinculado a projeto é só rastreio opcional~~ —
   **corrigido**: `projetoId` agora é **obrigatório em toda SAÍDA**
   (Charles: "toda saída precisa dizer pra qual projeto foi").
   `registrarMovimento` rejeita saída sem projeto. Continua sendo só
   rastreio, de propósito — não desconta orçamento nem mexe no custo
   real fechado do CP005 (Charles confirmou "só rastreio" nesse ponto).
   Testado ao vivo: saída sem projeto bloqueada; com projeto, quantidade
   desceu corretamente (50→40).

## Validação

- Testes novos (`tests/estoque.test.ts`): 13/13 (inclui os casos de
  fornecedor/preço obrigatório na entrada e projeto obrigatório na
  saída).
- Suite completa do app: 61/61 (nenhuma regressão nos testes
  anteriores).
- `tsc --noEmit`: limpo (strict, incl. `noUncheckedIndexedAccess` e
  `exactOptionalPropertyTypes`).
- `npm run build`: limpo, build de produção gerado sem erro.
- **Testado ao vivo no navegador, duas rodadas** (não só automatizado):
  1. Rodada inicial: criar item, entrada soma, saída válida subtrai,
     saída maior que o estoque bloqueada.
  2. Depois da revisão de escopo: `localStorage.clear()` pra partir
     limpo; entrada sem fornecedor bloqueada (alerta certo, quantidade
     inalterada); entrada completa (fornecedor+preço) funcionou;
     saída sem projeto bloqueada; criei cliente+projeto de teste ao
     vivo e confirmei saída com projeto vinculado descontando
     corretamente (50→40). Servidor parado depois de cada rodada.

## Status

READY_FOR_TECHNICAL_REVIEW. Aguardando sua revisão das suposições da
seção acima antes de qualquer freeze ou avanço pro CP007.
