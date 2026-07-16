# Auto-revisão do CP001+CP002 Mobi Gestor — Claude Code

Rodei `/code-review medium` (3 agentes finder + verificação) no diff completo
do Gestor antes de considerar a madrugada "pronta para revisão humana".
Achados reais, corrigidos nesta branch:

## Corrigido

1. **Bug real de produto**: depois de marcar um orçamento como `PERDIDO`, a
   tela escondia o formulário de novo orçamento para sempre — não havia como
   re-orçar um projeto perdido. Corrigido: o formulário volta a aparecer
   quando o orçamento mais recente está `PERDIDO`, e o resumo antigo continua
   visível (histórico não se perde). Teste de regressão adicionado.
2. Orçamento com valor vazio/zero/negativo agora é rejeitado com aviso, em
   vez de criar silenciosamente um orçamento de R$0,00.
3. Desconto/margem/comissão agora são limitados a 0–100 no código (não só no
   HTML, que pode ser contornado).
4. Nome/contato/responsável em branco (só espaços) agora são rejeitados em
   vez de criar cliente/projeto com dado vazio.
5. "Motivo da perda" agora é gravado sem espaços sobrando nas pontas.
6. "há Xd" não mostra mais número negativo se o relógio do sistema andar
   pra trás.

## Encontrado, corrigido depois (com calma, fora do horário de madrugada)

- **Sem índice O(1)** para achar cliente/orçamento de um projeto — trocado por
  `Map` em `App.render()`. Commit `3390b73`.
- **Card de projeto renderizado inline** dentro de `.map()`/template literal —
  extraído para `renderProjetoCard()`. Commit `3a11aa7`.
- **Duplicação entre `ClienteRepository`/`ProjetoRepository`/`OrcamentoRepository`**
  — movido para `LocalStore.append()`/`LocalStore.update()` genéricos, com
  teste próprio (`local-store.test.ts`, 6 casos incluindo JSON corrompido e
  valor não-array). Commit `f6599a5`. Nenhum comportamento mudou — todos os
  testes antigos dos três repositórios continuam passando sem alteração.

## Encontrado mas NÃO corrigido (deliberado — ver justificativa)

- **Sem lock/concorrência entre abas do navegador** (dois `localStorage.setItem`
  concorrentes podem se sobrescrever). Não é um problema real hoje — é
  aplicação local de uma pessoa só. Vira problema quando/se o Gestor virar
  multiusuário, que já está registrado como decisão de arquitetura pendente
  no `ROADMAP.md`.
- **`window.prompt()` pro motivo da perda** — já estava documentado como
  simplificação temporária no ROADMAP.md antes da revisão; mantido.

## Validação após as correções

- Testes: 24/24 no módulo (era 17 antes da revisão, +1 regressão do bug de
  re-orçamento, +6 do LocalStore genérico).
- Regressão da raiz: 461/461 (50 arquivos, era 447 antes do CP002 inteiro).
- Testado ao vivo em cada etapa: orçamento perdido → novo orçamento
  reaparece; submissão com valor vazio → bloqueada; status de projeto
  atualizado após o refactor do LocalStore → persiste corretamente. Dados
  de teste sempre limpos do localStorage antes de encerrar.
