# Achado + ferramenta de melhoria: TracePoint já resolve o DINABOX_GROWTH_PROFILE

Autor: Claude Code
Data: 2026-07-17

## Achado

Explorando material histórico da plataforma (logs antigos do MobiCopilot,
`dinabox_knowledge.json`, ferramenta MobiView), encontrei uma técnica já
usada e comprovada em sessões anteriores: um `TracePoint` do Ruby
capturando toda chamada real dentro do próprio motor do DinaBox durante
uma edição manual no SketchUp.

Log real capturado (2026-07-11, teste com Balcão inferior):

```
Dinabox::ComponentsUtils#set_component_attributes | ARGS=[...,
[["_lenz_formula", "50.0"], ["_profundidade_formula", "\"50.0\""],
["_leny_formula", "60.0"], ["_altura_formula", "\"60.0\""],
["_lenx_formula", "90.0"], ["_largura_formula", "\"90.0\""],
["_mlmax_formula", "\"274.0\""], ["_mlmin_formula", "\"8.0\""],
["_mamax_formula", "\"274.0\""], ["_mamin_formula", "\"8.0\""]]]
```

Isso confirma duas coisas que hoje são suposição/lastro fraco no Origin:

1. Os campos que `dinabox_formula_attributes` (Origin) escreve batem
   exatamente com o mecanismo real do DinaBox.
2. `_mlmax_formula`/`_mamax_formula` = 274.0cm = 2740mm — os limites em
   `dinabox_limits` do JSON de entrada têm lastro real, não são chute.

Também descartei uma hipótese: `orientation` (parâmetro de
`Dinabox::PlaceComponent.new`) é string constante (`"wall"`) em todos os
tipos testados (Balcão, Torre) — é modo de colocação, não direção de
crescimento. Não investigar esse caminho pra resolver âncora.

## Ferramenta de melhoria (proposta)

Essa mesma técnica resolve o `DINABOX_GROWTH_PROFILE` que a arquitetura
do CP004 pediu (qual direção largura/altura/profundidade crescem de
verdade após reconstrução) — com dado real em vez de suposição.

Proposta de teste:
1. Reinstalar/reaproveitar o mesmo TracePoint durante teste controlado:
   alterar SÓ largura de um Balcão via DinaBox, capturar bounds
   antes/depois; repetir isolado pra altura e profundidade.
2. Comparar `bounds.min`/`bounds.max` antes/depois em cada eixo pra
   saber se o crescimento é simétrico, só positivo, ou só negativo por
   eixo.
3. Isso vira o `DINABOX_GROWTH_PROFILE` com dado real — resolve o ponto
   que ficou em aberto sobre calibração de âncora no CP004, em vez da
   `PositionEngine` continuar assumindo `BACK_LEFT_BOTTOM = bounds.min`
   por suposição.

Não é escopo novo — é apontar uma ferramenta que já existe e já
funcionou pro problema certo.
