# Coordenação de Trabalho Paralelo

Este diretório existe porque duas frentes de implementação (Work e Claude Code)
commitam no mesmo repositório sem um servidor Git compartilhado em tempo real
(pushes falharam por autenticação; a troca acontece por bundle/patch/zip via
Charles). Sem um registro comum, nenhuma das duas frentes sabe o que a outra
já fez ou está fazendo. Este diretório é esse registro comum.

## Regra 1: leia STATUS.md antes de começar qualquer checkpoint

`STATUS.md` lista toda branch de checkpoint ativa: quem a criou, o escopo, o
status atual e o commit mais recente. Antes de criar uma branch nova ou
continuar uma existente, confira se a área/módulo já não está em progresso
pela outra frente.

## Regra 2: toda branch nova entra em STATUS.md no mesmo commit que a cria

Não existe branch "invisível". Se você criou `checkpoint/x`, o commit que a
cria (ou o primeiro commit da branch) também atualiza `STATUS.md` com uma
linha nova.

## Regra 3: cada frente usa sua própria pasta de handoff

- `WORK/` — relatórios de handoff e entrega gerados pelo Work.
- `CLAUDE_CODE/` — relatórios de handoff e implementação gerados pelo Claude Code.

Isso evita que os dois escrevam no mesmo arquivo de relatório ao mesmo tempo
(conflito de merge) e dá um histórico git real de cada handoff, em vez de
depender só de zips soltos fora do repositório.

## Regra 4: branch = unidade de propriedade

Cada checkpoint vive na sua própria branch. Ninguém edita a branch de
checkpoint que a outra frente está com trabalho em andamento (`STATUS =
EM_PROGRESSO`). Se precisar mexer em algo que a outra frente tocou, crie uma
branch nova a partir da branch dela — nunca reescreva a branch original.

## Regra 5: identidade do autor vai na mensagem de commit

Como o `git config user.name` local é o mesmo (Charles) nos dois ambientes, a
mensagem de commit deve comecar com um marcador:

```
[WORK] <mensagem>
[CLAUDE CODE] <mensagem>
```

Isso torna o autor real identificável em `git log` sem depender só de
`STATUS.md`.
