# Regras Construtivas Gerais — consolidado

Resposta à Dúvida 04 do Claude Code
(`PROJETOS/CLIENTES/DUVIDAS E RESPOSTAS CLAUDE/JANAINA_COZINHA.md`).
Regras do Charles e soluções técnicas que já apareceram em mais de um
projeto/teste real, separadas do que é específico de um cliente só.

Cada regra tem status de confiança — não estou prometendo como
`CONFIRMED` geral algo que só vi uma vez.

---

## CONFIRMADAS como regra geral (apareceram em mais de um projeto/teste)

### 1. Menor medida em ambiguidade

Quando duas leituras da mesma cota divergem (desenho a mão, imprecisão de
campo), usar sempre a **menor** das duas.

- Aplicada na Ilha da Janaína: altura 845 vs 855mm → usar 845mm.
- Aplicada na Ilha da Taciana: mesmo padrão.
- Aplicada na bancada da pia da Cozinha da Janaína: 750mm ("LEI").

Frase do Charles (Ilha Janaína): "qualquer uma delas vai ter que usar pé
de plástico para nivelar e depois fazer acabamento, pode escolher
qualquer uma."

### 2. Pé de plástico / rodapé absorve diferença de nivelamento

Consequência direta da regra 1: como todo módulo é nivelado na obra com
pé de plástico regulável e depois a marmoraria cobre com rodapé de
pedra, pequenas diferenças de leitura (poucos mm a ~1cm) não importam —
não vale gastar tempo tentando decidir entre duas leituras próximas.

### 3. z=0 = chão acabado (não chão bruto)

Resolvida agora em H9: "Balcão a partir do rodapé, abaixo do balcão
sempre haverá rodapé ou pé de plástico." `position_mm.z = 0` já
representa o chão acabado — o rodapé/pé de plástico fica implícito
abaixo. Nunca somar +100mm (ou qualquer valor de pé de plástico) à parte
no Origin — isso já está embutido na referência z=0.

### 4. Posição sempre 0 → positiva, nunca negativa

Regra absoluta pra posição de módulo dentro do ambiente real: nunca usar
coordenada negativa. Evitar âncora `CENTER_BOTTOM` (ela tende a gerar
metade da peça em X/Y negativo). Preferir `BACK_LEFT_BOTTOM` ou
equivalente que mantenha tudo em quadrante positivo.

**Exceção que não é exceção**: a zona técnica de calibração do Origin
Eyes (masters DinaBox antes de instanciar) usa `X=-1000, Y=0, Z=0` —
isso é coordenada de staging/calibração, fora da cena real do ambiente,
não é posição de módulo de cliente. Não confundir os dois espaços.

### 5. Erro do arquiteto quando o levantamento não mostra apoio/quina

Se o levantamento de campo não confirma uma quina, parede separada ou
ponto de apoio que aparece só no desenho do arquiteto, considerar que é
suposição/erro do arquiteto — não promover a estrutura assumida no CAD
sem confirmação de campo.

- Aplicada na Cozinha da Janaína: "Parede C" perto da geladeira, descartada.

### 6. Desconto de profundidade por camada (Cozinha Janaína, confirmado nesse projeto — ainda não visto em outro)

`construction_rules_mm` desse projeto:
```
wall_side: 38
vista: 20
tamponamento: 18
front: 22
helper_side: 15
stone_drip: 15
```

Padrão observado nos módulos reais:
- Balcão simples (sem bancada de pedra): `final_depth = raw_depth - front(22)`.
  Ex.: MODULO_001, raw 600 → final 578.
- Aéreo: mesmo padrão, só desconto de `front(22)`.
  Ex.: raw 350 → final 328.
- Balcão com bancada de pedra (fórmula nomeada `BALCAO_COM_BANCADA_PEDRA`):
  `final_depth = raw_depth - front(22) - stone_drip(15)`.
  Ex.: MODULO_003, raw 750 → final 713.

Marco isso como confirmado só pra Cozinha Janaína até ver se repete
noutro projeto — os *nomes* das camadas (front, stone_drip, etc.)
parecem genéricos o bastante pra serem regra geral de marcenaria, mas os
*valores* podem mudar por projeto/material.

### 7. Gap zero entre módulos encostados

Quando dois módulos ficam lado a lado na mesma parede sem vão entre
eles, a posição do segundo é simplesmente `x_anterior + largura_anterior`
— sem desconto/gap adicional. Ex.: MODULO_002 (`x=900`) encostado direto
no MODULO_001 (largura 900).

### 8. Nicho de eletro embutido — folga lateral/topo e recuo de ventilação

Confirmado por Charles (22/07/2026) depois de eu achar uma diferença
real entre o nicho da geladeira modelado (820×770×1800mm) e a ficha
real da geladeira (820×1860×770mm — bate exato em largura/profundidade,
diferente em altura): "ESTOU APLICANDO UMA REGRA DE 30MM DA GELADEIRA
AS LATERIAIS E 50MM NO TOPO DA GELADEIRA AO ACABAMENTO DO NICHO... E
TAMBÉM DEIXEI 50MM RECUADO DA PAREDE PARA TER VENTILAÇÃO."

Ou seja: nicho de eletro embutido não é a dimensão exata do eletro —
tem folga de 30mm nas laterais, 50mm no topo (entre o eletro e o
acabamento do nicho), e 50mm de recuo em relação à parede de fundo
(ventilação). Confirmado especificamente pra geladeira; ainda não vi
esse padrão repetir noutro tipo de eletro (forno, lava-louças) — marcar
como regra de geladeira/eletros grandes até confirmar em outro caso.

---

## Observadas uma vez só — NÃO tratar como regra geral ainda

- **Altura do aéreo acima do balcão (z=1500mm)**: só vi isso na Cozinha
  Janaína. Pode ser específico desse projeto (altura do usuário, do
  cooktop, etc.), não confirmei que é padrão fixo pra todo aéreo em todo
  projeto.
- **Puxador padrão da casa inteira**: no projeto Cassio (não é Origin,
  é um cliente diferente da linha de conhecimento), o mesmo puxador
  apareceu em vários ambientes — mas isso foi observação de um único
  projeto de casa completa, não testei se isso vale pra clientes
  Origin/Cozinha isolada.
- **Tolerância 0.5mm**: aparece em todo módulo do JSON da Cozinha
  Janaína (`tolerance_mm: 0.5`), mas não confirmei se é valor fixo do
  schema/engine ou específico desse projeto.

---

## Fonte

Regras 1, 2, 4, 5: memória de projeto (governança já fixada com Charles
em conversas anteriores, replicada em Janaína e Taciana).
Regra 3: H9 nesta mesma pasta (`JANAINA_COZINHA.md`), resolvida agora
pelo Charles.
Regras 6, 7: leitura direta de `ORIGIN_PROJECT_FILE_V1_RECONCILED_DRAFT.json`
(anexado em `ANEXOS_JANAINA_COZINHA/`).
