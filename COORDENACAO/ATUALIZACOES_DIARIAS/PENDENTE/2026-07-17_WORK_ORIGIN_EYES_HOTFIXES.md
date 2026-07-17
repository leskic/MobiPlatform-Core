# 2026-07-17 - WORK - Origin Eyes Hotfixes

> **NOTA DO CLAUDE CODE (verificacao)**: recebido via bundle git (push que
> falhava por credencial, resolvido enviando .bundle pelo inbox local).
> O pacote real referenciado abaixo (`MOBI_ORIGIN_CP009_HOTFIX005_WORKING_SPATIAL_DELIVERY.zip`)
> **nao chegou** no inbox ate o momento deste push - so o relato em texto.
> Tratar todo o conteudo abaixo como NAO VERIFICADO contra codigo/pacote
> real ate esse arquivo (ou um mais recente da mesma frente) ser
> entregue e conferido. Ver PADRAO_DE_ENTREGA_WORK.txt.

## Resumo

Planificar foi congelado como prioridade. O foco voltou para Mobi Origin/Calibrador.

O Calibrador passou a ser tratado como `ORIGIN_EYES`: a camada que identifica os masters DinaBox na cena, calibra posicao/eixos e exporta um contrato legivel para Origin, Copilot e Claude sem abrir SketchUp.

## Entregas de codigo

Branch de trabalho onde os commits foram feitos:

- `checkpoint/mobi-origin-cp004-hotfix001-position-diagnostic`

Commits relevantes:

- `bff9dd3` - `Add Origin template master audit hotfix`
- `a6677b4` - `Export Origin Eyes calibration contract`
- `edc51f2` - `Add Origin Eyes success target inventory`
- `84c399c` - `Add Origin Eyes spatial inventory`
- `cf7eab6` - `Report working spatial inventory for Origin test assembly`

## Arquivos principais alterados

- `source/apps/mobi-origin-sketchup/mobi_origin.rb`
- `source/apps/mobi-origin-sketchup/mobi_origin/template_calibration_tool.rb`
- `source/apps/mobi-origin-sketchup/mobi_origin/janaina_project_agent.rb`
- `source/apps/mobi-origin-sketchup/mobi_origin/panel.rb`
- `source/apps/mobi-origin-sketchup/tests/mobi-origin-sketchup.test.ts`

## O que mudou

### HOTFIX001 - Master Audit

O Calibrador passou a exportar `master_audit` para cada tipo esperado:

- `BALCAO`
- `AEREO`
- `TORRE`
- `TAMPONAMENTO`

O relatorio inclui candidatos, atributos `mobi_origin`, dynamic attributes DinaBox, dimensoes e proxima acao.

### HOTFIX002 - Exporter Contract

Foi criado contrato legivel por Claude/Origin:

- `origin_eyes`
- `masters_found`
- `requested_masters`

O objetivo e permitir confirmar "master existe e esta calibrado" lendo JSON exportado.

### HOTFIX003 - Success Target

Foi definido alvo de sucesso para cena controlada:

- `BALCAO = 2`
- `AEREO = 0`
- `TORRE = 1`
- `TAMPONAMENTO = 1`

O relatorio agora possui:

- `origin_eyes.success_target`
- `origin_eyes.module_inventory`
- `origin_eyes.identification_success`

### HOTFIX004 - Spatial Inventory

O Eyes passou a exportar leitura espacial dos masters:

- sistema de coordenadas
- ordem no eixo `+X`
- eixo de frente `+Y`
- assinatura de sequencia
- adjacencia `TOUCHING`, `GAP`, `OVERLAP`

Tambem foi corrigida a ordem de exportacao no `CALIBRATE_TEMPLATE`: o contrato Eyes agora e recalculado depois da calibracao.

### HOTFIX005 - Working Spatial Inventory

Ao montar ambiente de teste:

- masters do template sao ocultados;
- resultado inclui `working_spatial_inventory`;
- `validation.actual` passa a listar tipos esperados com zero;
- falha de montagem vira `NEEDS_ACTION`, nao `BLOCKED`.

## Validacao automatizada

Ultima rodada apos HOTFIX005:

- Teste focado Origin: `25/25` passou.
- Build TypeScript: OK.
- Regressao completa: `504/504` passou.

## Teste humano

Houve teste humano parcial antes do HOTFIX005:

- Mobi Origin retornou `SUCCESS`.
- Requisitos: `BALCAO=2`, `AEREO=1`, `TORRE=1`, `TAMPONAMENTO=0`.
- `created_count=4`.
- Validacao retornou `VALID`.

Achado visual:

- A cena ainda podia confundir masters com instancias criadas.

Acao tomada:

- HOTFIX005 adicionou ocultacao de masters e inventario espacial das instancias `WORKING`.

Status humano do HOTFIX005:

- Ainda nao testado no SketchUp real depois do pacote HOTFIX005.

## Entregas ZIP/RBZ

Ultimo pacote entregue:

- `MOBI_ORIGIN_CP009_HOTFIX005_WORKING_SPATIAL_DELIVERY.zip`
- SHA256: `23bee3309aa248b2bb0633086a0c83690d6f1337b41cb8ed5aeedaa86fb865c9`

RBZ principal:

- `MobiOrigin_CP009_HOTFIX005_WorkingSpatialInventory.rbz`

## Proxima acao recomendada

Charles deve instalar o HOTFIX005, rodar `MONTAR AMBIENTE DE TESTE` e enviar:

- print da cena;
- JSON completo do resultado;
- se possivel, `MOBI_ORIGIN_TEMPLATE_CALIBRATION_REPORT.json`.

Se ainda houver peca solta ou ordem errada, o proximo ajuste deve ser no layout/`position_for` do teste, nao no Project File.
