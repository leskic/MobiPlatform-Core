# Backup Manifest

| Campo | Valor |
|---|---|
| Data local | 2026-07-13 — America/Recife |
| Checkpoint | `MOBI_PLATFORM_CHECKPOINT_001` |
| Status | `READY_FOR_HUMAN_VALIDATION` |
| Branch | inexistente/não inicializada |
| Commit | inexistente/não inicializado |
| Baseline anterior MIC ZIP SHA-256 | `f074e5f7c95fcb57522cb75f8b97875b1040c77c50b9f63a322a5063fd35f47d` |
| Entrega CP001 anterior ZIP SHA-256 | `496887e92ea750747c959e302ada3034a923f94f1e6fd0d158b86ea4a57c6c32` |
| Source preservado | 1.032 arquivos, com correspondência integral à baseline após excluir apenas dependências e cobertura regeneráveis |
| Build | `npm run build` e `npx tsc --noEmit -p tsconfig.checkpoint001.json` |
| Testes | `npm test` e `npx vitest run --coverage --config vitest.checkpoint001.config.ts` |

## Escopo

O backup contém código-fonte, testes, manifests, lockfile, governança disponível, checkpoints, RfEs, relatórios, evidências e instruções de recuperação.

## Exclusões intencionais

- `node_modules/`: regenerável por `npm ci`;
- diretórios HTML/JSON de cobertura: regeneráveis pelo comando de coverage;
- segredos, tokens, senhas e credenciais;
- estado operacional externo, caches e configurações de máquina.

## Limitações

Os documentos de governança inexistentes na baseline não foram inventados. A autorização e aprovação do RfE foram preservadas como registros objetivos em `rfe/`. O backup não substitui a homologação de CHARLES e não autoriza Freeze.
