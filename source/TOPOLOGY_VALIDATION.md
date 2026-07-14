# Topology Validation — Fase 3.1

O validador opera no plano X/Z e usa tolerância fixa de `1e-7`. A ordem de entrada é preservada nos diagnósticos.

Valida: referências inexistentes, comprimento zero, parede duplicada, sobreposição collinear, auto-interseção, interseção interior ilegal, conectividade dos endpoints, loop aberto e loop fechado. Loops válidos exigem pelo menos três segmentos, grau exatamente dois em cada vértice e retorno ao ponto inicial após consumir todos os segmentos selecionados.

A detecção automática percorre cada componente conexo de paredes. Um único loop pode formalizar ou atualizar o `Environment`; dois ou mais loops no mesmo ambiente geram `AMBIGUOUS_LOOPS`. Ambientes distintos são detectados e atualizados independentemente.

Conexões L, T e X são operações explícitas com cardinalidades 2, 3 e 4 e movem o endpoint mais próximo de cada parede ao ponto de junção. Nenhuma heurística ou IA é utilizada. Room inválido é recusado antes da transação; a `TopologyRule` repete a validação no RuleRunner antes do commit. Falha de regra produz rollback atômico.

## Matriz executada

| Cenário | Resultado esperado | Evidência |
|---|---|---|
| Loop aberto | inválido | teste aprovado |
| Loop fechado retangular/poligonal | válido | teste aprovado |
| Parede duplicada | inválido | teste aprovado |
| Sobreposição | inválido | teste aprovado |
| Interseção ilegal | inválido | teste aprovado |
| Múltiplos loops | ambíguo/inválido | teste aprovado |
| Múltiplos ambientes | detecção independente | teste aprovado |
| Ambiente inválido | commit bloqueado | teste aprovado |
| Ambiente válido | commit aprovado | teste aprovado |
| RuleRunner rejeitante | rollback sem mutação | teste aprovado |
