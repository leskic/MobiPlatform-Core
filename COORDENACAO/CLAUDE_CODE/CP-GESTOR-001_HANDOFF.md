# CP001 Mobi Gestor — Handoff — Claude Code

Branch: `checkpoint/cp-gestor-001-foundation`

## Contexto

Charles descreveu a visão completa do Mobi Gestor (CRM/ERP de marcenaria:
captação, levantamento multi-formato, comercial, engenharia, produção,
compras, estoque, financeiro, indicadores, IA, integrações externas). Isso
é escopo de produto de longo prazo. Em vez de tentar implementar tudo de
uma vez, quebrei em fases (`apps/mobi-gestor/ROADMAP.md`) e implementei
apenas o CP001: a menor fatia que já responde à pergunta central da visão
("o que está atrasado, quem está parado, qual cliente precisa de
atenção").

## Escopo implementado

- Cadastro de Cliente (nome, contato, origem do lead, interesse, responsável).
- Cadastro de Projeto vinculado a um Cliente (nome, status, prioridade, responsável).
- Atualização de status de um projeto existente (select inline na lista).
- Painel "O que precisa da sua atenção": lista automaticamente projetos
  com status `ATRASADO` (erro) ou sem atualização há 7+ dias (aviso),
  ordenados com erros primeiro. Projetos `CONCLUIDO` nunca aparecem aqui.
- Persistência local via `localStorage` (decisão de arquitetura registrada
  no ROADMAP.md — sem backend/banco por enquanto).

## Fora de escopo (deliberado, ver ROADMAP.md)

Orçamento, produção, compras, estoque, financeiro, indicadores, IA,
qualquer integração externa, qualquer ingestão de arquivo (áudio, PDF,
DWG, etc.).

## Validação

- Registrado em `source/tsconfig.json` e `source/vitest.config.ts` (mesmo
  padrão dos outros apps) para que build/test da raiz cubram o módulo.
- Build do módulo (`tsc --noEmit` + `vite build`): passou, gera `dist/` real.
- Testes do módulo: 10/10.
- Build da raiz: limpo.
- Regressão completa da raiz: 447/447 (48 arquivos) — eram 437 antes desta
  branch, +10 dos testes novos do Gestor, nada quebrou.
- Testado ao vivo no navegador: subi `npm run dev` (porta 5174), cadastrei
  um cliente e um projeto de verdade pela interface, marquei o projeto
  como ATRASADO, e confirmei que o painel de Atenção reagiu automaticamente
  mostrando "Cozinha Torres — Marcado como atrasado". Dados de teste
  limpos do localStorage depois da verificação.

## Status

READY_FOR_TECHNICAL_REVIEW. Não fiz merge, push, nem iniciei CP002.
