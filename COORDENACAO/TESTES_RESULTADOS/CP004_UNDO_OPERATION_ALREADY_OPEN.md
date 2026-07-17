# CP004 — "Undo operation already open" (Mobi Origin)

Bug achado por Charles testando ao vivo no SketchUp 2026, sobre o plugin
Mobi Origin (`MOBI_TEMPLATE_V001.skp`, botões "MONTAR AMBIENTE DE TESTE"
e "EXECUTAR JSON DE ENTRADA"). Nota: o Mobi Origin (plugin SketchUp/Ruby)
não é versionado neste repositório — chega como `.rbz`/zip solto via
Charles. Este arquivo existe aqui porque é comunicação entre as frentes,
mesmo sem o código-fonte do Origin estar aqui.

## 2026-07-17 06:41 — Achado inicial

Print real: botão "MONTAR AMBIENTE DE TESTE" (2 Balcão/1 Aéreo/1
Torre/0 Tamponamento) retornou:
```json
{"status": "FAILED", "error": "RuntimeError", "message": "Undo operation already open"}
```
Geometria parcial visível no modelo, sobra de operação que não fechou.

## HOTFIX001 (`CP004_HOTFIX001_POSITION_DIAGNOSTIC`)

Corrigiu 2 bugs distintos achados antes deste (`rotation_z_deg` não
aplicado; falta de modo `DIAGNOSTIC` pra preservar geometria em falha).
Não corrigia ainda o "Undo operation already open" em si.

## HOTFIX002 (`CP004_HOTFIX002_OPEN_UNDO_GUARD`)

`start_origin_operation` passa a capturar especificamente essa mensagem
de erro e marcar `external_operation: true` em vez de propagar. Testado
por Charles: **sucesso** uma vez (`status: SUCCESS`, 4 volumes), depois
**regrediu** — mesmo erro voltou, geometria acumulando mais ainda (5
volumes). Causa: o guard tolerava o erro mas nunca fechava a operação
órfã, então ela persistia entre execuções.

## HOTFIX003 (`CP004_HOTFIX003_STALE_UNDO_RECOVERY`)

`recover_stale_operation` fecha a operação órfã (`commit_operation`,
preserva geometria) e tenta abrir uma nova limpa. Testado: **ainda
falhou** ao vivo no botão CP002.

## HOTFIX004 (`CP004_HOTFIX004_CP002_NO_UNDO_OPERATION`)

Mudança de estratégia pro fluxo `prepare_environment_instances`
("MONTAR AMBIENTE DE TESTE"): parou de usar `start_operation` por
completo. Testado: **sucesso confirmado e estável**
(`status: SUCCESS, created_count: 4, validation: VALID`).

## HOTFIX005 (mesma abordagem em `execute_from_input_file`)

Aplicou a mesma remoção de `start_operation` pro fluxo "EXECUTAR JSON DE
ENTRADA" (o caminho mais longo, usado com
`cozinha_janaina_input_TESTE_COPILOT.json`). Motivo: Charles confirmou
que todos os testes do dia usaram esse JSON repetidamente — esse fluxo
cria piso/mapa/paredes/10 áreas/10 módulos/placeholder numa sequência
longa, suspeito principal da operação órfã. Teste seguinte: **erro
voltou a aparecer**.

## HOTFIX006 (`CP004_HOTFIX006_NO_UNDO_CODEPATHS`)

Como o erro reapareceu mesmo sem nenhum código chamar
`start_operation`/`commit_operation`/`abort_operation` (confirmado por
grep no código-fonte: zero ocorrências), a hipótese virou "build
antigo/cacheado ainda rodando" em vez de bug novo. Adicionado
`BUILD_ID = "CP004_HOTFIX006_NO_UNDO_CODEPATHS"` em toda resposta do
painel, especificamente para permitir verificar isso.

**Critério de teste**: reinstalar, reiniciar o SketchUp por completo, e
antes de qualquer botão conferir se o Status mostra
`"build_id": "CP004_HOTFIX006_NO_UNDO_CODEPATHS"`. Se não mostrar esse
valor exato, o SketchUp está com build antigo — não investigar mais até
isso ser corrigido. Se mostrar e o erro voltar mesmo assim, a causa está
fora do controle do código do Origin (outra extensão, ou o próprio
SketchUp).

**Status em 2026-07-17 07:2x: aguardando esse teste.**
