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
  projeto opcional vinculado, motivo livre.
- `ItemEstoqueRepository.registrarMovimento` atualiza a quantidade e
  grava o movimento numa única operação; SAÍDA que deixaria a
  quantidade negativa é rejeitada sem alterar nada (mesmo idioma de
  guarda do `OrcamentoRepository.registrarFechamento`).
- `AtencaoEngine.computeAtencao` ganhou terceiro parâmetro opcional
  (`itensEstoque`) — item abaixo do mínimo vira item de atenção
  `warning` no mesmo painel já existente.
- Nova seção "Compras e estoque" na UI: cadastro de item + formulário
  de entrada/saída por item.

## Suposições que PRECISAM da sua revisão

1. Estoque é global, um depósito só — sem múltiplas localizações.
2. Sem fornecedor nem preço de compra — só quantidade (nome, unidade,
   mínimo, atual).
3. Não vinculado a `ItemLevantamento`/BOM do projeto ainda — são dois
   sistemas separados por enquanto (levantamento = nomes de móveis do
   projeto; estoque = materiais/ferragens do almoxarifado). Se a
   intenção real é ligar os dois (ex.: cada item do levantamento debita
   estoque automaticamente), isso é modelo de dado diferente — avisa
   que eu redesenho.
4. Movimento de SAÍDA vinculado a projeto é só um campo opcional de
   rastreio (`projetoId`) — não desconta nada de orçamento nem afeta
   custo real do CP005 automaticamente.

## Validação

- Testes novos (`tests/estoque.test.ts`): 10/10.
- Suite completa do app: 58/58 (nenhuma regressão nos 48 testes
  anteriores).
- `tsc --noEmit`: limpo (strict, incl. `noUncheckedIndexedAccess` e
  `exactOptionalPropertyTypes`).
- `npm run build`: limpo, build de produção gerado sem erro.
- **Testado ao vivo no navegador** (não só automatizado): subi o dev
  server, cadastrei item "Dobradiça 35mm" (mínimo 20 un) — apareceu no
  painel de atenção com 0 un. Registrei entrada de 50 — saiu do painel,
  quantidade 50. Registrei saída de 30 — quantidade 20, ok. Tentei
  saída de 999 — bloqueada com alerta claro, quantidade confirmada
  inalterada (20) via inspeção direta do DOM antes/depois. Servidor
  parado depois do teste.

## Status

READY_FOR_TECHNICAL_REVIEW. Aguardando sua revisão das suposições da
seção acima antes de qualquer freeze ou avanço pro CP007.
