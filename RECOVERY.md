# Recovery

## Abrir o projeto

1. extraia `MOBI_PLATFORM_FULL_BACKUP_CP001.zip`;
2. entre em `MOBI_PLATFORM_FULL_BACKUP_CP001/source/`;
3. leia, nesta ordem: `../CURRENT_STATE.md`, `../BACKUP_MANIFEST.md`, `MOBI_PLATFORM_CHECKPOINT_001_HANDOFF.md` e `MOBI_PLATFORM_CHECKPOINT_001_IMPLEMENTATION_REPORT.md`;
4. não reinicie implementações concluídas.

## Verificar integridade

Na raiz do backup:

```bash
sha256sum -c BACKUP_CHECKSUMS.sha256
```

Na pasta `source/`, o manifesto anterior também pode ser validado:

```bash
sha256sum -c MOBI_PLATFORM_CHECKPOINT_001_CHECKSUMS.sha256
```

## Instalar dependências

Requisitos: Node.js compatível com ES2022 e npm.

```bash
cd source
npm ci
```

O `package-lock.json` está incluído. Nenhuma dependência precisa ser recuperada de um caminho temporário.

## Build

```bash
npm run build
npx tsc --noEmit -p tsconfig.checkpoint001.json
```

## Testes

```bash
npm test
npx vitest run --coverage --config vitest.checkpoint001.config.ts
```

Resultados esperados na baseline deste backup:

- regressão: 313/313;
- checkpoint e contratos: 43/43;
- cobertura do código novo: 100%.

## Migrar para Git

Após validar hashes e testes:

```bash
cd source
git init
git add .
git commit -m "Mobi Platform Checkpoint 001 validated baseline"
```

Configure remote, identidade e políticas de branch somente no ambiente de destino. Este backup não contém remote, branch ou commit preexistente.

## Continuar em outro WORK

- considerar `MOBI_PLATFORM_CHECKPOINT_001` concluído tecnicamente;
- não recriar contratos, adapters ou produtos presentes;
- aguardar o resultado de CHARLES;
- não declarar Freeze ou iniciar checkpoint novo sem autorização;
- se a validação divergir, preservar evidências e registrar o desvio antes de alterar código.

