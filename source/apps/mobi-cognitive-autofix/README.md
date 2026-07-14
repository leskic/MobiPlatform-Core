# Mobi Cognitive Auto-Fix

Execução determinística de propostas `PENDING` autorizadas por Golden Rules documentadas. O app valida elegibilidade, executa somente pelo `TransactionCoordinator`, registra auditoria e oferece rollback, undo e redo atômicos.

Escopo inicial autorizado: correção de referência de material ausente. Walls, Rooms, Openings e qualquer alteração topológica são bloqueados.

Validação: `npx tsc -p apps/mobi-cognitive-autofix/tsconfig.json --noEmit` e `npx vitest run --coverage --config apps/mobi-cognitive-autofix/vitest.config.ts`.
