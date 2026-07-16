# Mobi Dinabox Adapter Foundation v1

Camada determinística que extrai dados paramétricos Dinabox, mapeia um descritor explícito e delega sua construção ao Mobi Constructor.

O Adapter não cria entidades, não escreve no Origin e não executa `TransactionRequest`.

## Verificação

```bash
npm run build
npm test
npm run coverage
```

## CP017-001

`DinaboxPreflight` inspeciona um projeto Dinabox antes da adaptação e retorna um relatório de prontidão sem executar Constructor, Origin ou transações.
