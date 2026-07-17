# Testes e Resultados

Central de comunicação sobre **teste humano real** entre as três frentes
do projeto (Charles, Work, Claude Code — Janaína quando estiver ativa).
Complementa `COORDENACAO/WORK/` e `COORDENACAO/CLAUDE_CODE/` (que são
handoff de implementação); esta pasta é especificamente sobre o que
aconteceu quando alguém testou de verdade (SketchUp real, navegador
real), não sobre o que o código deveria fazer.

## Por que isso existe

Historicamente, teste humano real ficava só em prints soltos e
mensagens de chat — sem registro comum, cada frente reconstituía o
estado a partir de relato de segunda mão. Isso já causou confusão real
(ex.: "corrigido, testado" sem o teste humano ter de fato acontecido,
ou hotfixes sucessivos pro mesmo bug sem histórico claro do que já foi
tentado).

## Regra: um arquivo por investigação/bug, não por mensagem

Não criar um arquivo novo a cada retorno de teste. Um bug ou frente de
teste (ex.: "CP004 Undo Operation") ganha UM arquivo, atualizado
incrementalmente até fechar — igual ao padrão já usado em
`STATUS_PROJETO_MOBI.md` fora do repositório.

## Regra: sempre citar o resultado exato, não a interpretação

Registrar o `status`/`error`/`message` literal retornado pelo painel
(ou o print, quando não há JSON), não só "funcionou"/"não funcionou".
Isso é o que permite auditar depois se um hotfix realmente resolveu o
que foi reportado.

## Índice

- [`CP004_UNDO_OPERATION_ALREADY_OPEN.md`](./CP004_UNDO_OPERATION_ALREADY_OPEN.md)
  — histórico completo do bug "Undo operation already open" no Mobi
  Origin (HOTFIX001 até HOTFIX006), 2026-07-17.
