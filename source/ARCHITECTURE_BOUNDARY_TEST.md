# Architecture Boundary Test

O teste executável está em `mobi-products/mobi-studio/tests/architecture-boundary.test.ts` e é incluído pela suíte oficial da Fase 3 do Studio.

Ele percorre recursivamente `src` e `tests` de Mobi Studio e Mobi Constructor e bloqueia imports cujo caminho contenha qualquer um destes segmentos:

- `apps`
- `builder`
- `origin`
- `transaction`
- `foundation`
- `mobi-products`

Assim, o teste impede dependência de internals da Plataforma, de aplicações, do builder e entre produtos. O resultado final foi zero violações.

Comando de validação:

```bash
npx vitest run --config mobi-products/mobi-studio/vitest.phase3.config.ts
```
