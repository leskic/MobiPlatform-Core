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

## Encontrado mas NÃO corrigido (deliberado — ver justificativa)

- **Duplicação entre `ClienteRepository`/`ProjetoRepository`/`OrcamentoRepository`**
  (`add`/`atualizarStatus` seguem o mesmo padrão nos três). Um `LocalStore`
  genérico com `add`/`update` reduziria a duplicação. Não fiz porque é
  refactor, não bugfix, e prefiro não mexer em três arquivos que já
  passaram em teste/uso ao vivo às 3h da manhã sem alguém revisando.
- **Sem lock/concorrência entre abas do navegador** (dois `localStorage.setItem`
  concorrentes podem se sobrescrever). Não é um problema real hoje — é
  aplicação local de uma pessoa só. Vira problema quando/se o Gestor virar
  multiusuário, que já está registrado como decisão de arquitetura pendente
  no `ROADMAP.md`.
- **Sem índice O(1)** para achar cliente/orçamento de um projeto (usa `.find()`
  linear). Escala mal com milhares de registros, mas hoje são dezenas. Otimização
  prematura pro estágio atual.
- **`window.prompt()` pro motivo da perda** — já estava documentado como
  simplificação temporária no ROADMAP.md antes da revisão; mantido.

## Validação após as correções

- Testes: 18/18 no módulo (era 17, +1 de regressão pro bug do re-orçamento).
- Regressão da raiz: 455/455 (49 arquivos).
- Testado ao vivo: criei orçamento, marquei Perdido, confirmei que o
  formulário de novo orçamento reaparece, criei um segundo orçamento de
  valor diferente, confirmei que o valor exibido atualizou. Testei submissão
  com valor vazio — bloqueada. Dados de teste limpos do localStorage.
