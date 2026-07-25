# Mobi Gestor — Roadmap

A visão completa (fornecida por Charles em 2026-07-16) descreve um centro
operacional completo: captação de cliente, levantamento multi-formato
(áudio, foto, vídeo, PDF, DWG, IFC, SketchUp...), comercial, engenharia,
produção, CNC, compras, estoque, montagem, pós-venda, financeiro, gestão,
inteligência artificial e uma dezena de integrações externas (WhatsApp,
ERP, Power BI, etc).

Isso é escopo de produto de longo prazo, não de um checkpoint. Registrar
tudo aqui evita perder a visão, e evita também tentar implementar tudo de
uma vez sem especificação real de cada parte.

## Fases propostas

| Fase | Escopo | Status |
|---|---|---|
| CP001 | Fundação: cadastro de Cliente, cadastro de Projeto vinculado, painel "O que precisa de atenção" (atrasado / parado) | **Implementado** |
| CP002 | Comercial: orçamento, negociação, desconto, margem, comissão, motivo de perda | **Implementado — com suposições, ver seção abaixo** |
| CP003a | **Importar itens de PDF** (extração de lista de itens/módulos de uma planta vetorial, com revisão humana antes de confirmar). **Implementado — ver seção abaixo.** | **Implementado** |
| CP003b | Calculadora de preço a partir do custo real (matéria-prima + mão de obra + custo fixo + markup → sugestão de valor). **Implementado — versão simplificada, ver seção abaixo.** | **Implementado** |
| CP004 | Produção: fila, etapas, responsável, prioridade | **Implementado — ver seção abaixo** |
| CP005 | Fechamento do projeto: custo estimado x real, log de mudança de escopo | **Implementado — ver seção abaixo** |
| CP006 | Compras e estoque: itens faltantes, entrada/saída | **Implementado — ver seção abaixo** |
| CP007 | Financeiro: valor vendido, custos, fluxo de caixa | Não iniciado |
| CP008 | Indicadores/KPIs: setor atrasando, ranking, tempo médio | Não iniciado |
| CP009+ | Integrações externas (WhatsApp, ERP, ferramentas de corte, Power BI) e IA (perguntas em linguagem natural, sugestões) | Não iniciado — cada integração precisa de checkpoint próprio, credenciais e decisão de arquitetura separada |
| CP00X | **Entrada de áudio + transcrição** (definido por Charles em 16/07): usuário fala sua visão do projeto ou uma atualização ("o que vai ter, o que vai sair"), sistema transcreve e pede confirmação se precisar validar dado. Depende de escolher serviço de voz→texto — decisão de arquitetura/custo, não iniciar sem definir isso primeiro. | Não iniciado |

## Relação arquitetural Gestor ↔ Origin (definida por Charles em 16/07)

**Mobi Gestor é a porta de entrada do Mobi Origin.** Origin é guiado pelo
Gestor, mas é **independente** — não se funde com o Gestor, só recebe
entrada dele. Isso substitui/esclarece uma ambiguidade anterior (o Work
tinha classificado "Origin" como terminologia legada/interna, não produto
ativo — Charles confirma agora que é produto real e distinto, com essa
relação específica de dependência de entrada). Ver `STATUS_PROJETO_MOBI.md`
e memória do Claude Code para o histórico completo dessa correção.

## Por que começar pelo CP001 assim

A pergunta que mais se repete na visão do Charles é: "o que está atrasado,
quem está parado, qual cliente precisa de atenção". CP001 responde
diretamente a essa pergunta com o menor recorte possível: cliente,
projeto, status, e uma lista derivada de atenção. Sem isso, nenhuma das
fases seguintes (comercial, produção, financeiro) tem uma base para se
apoiar.

## Decisão de arquitetura assumida no CP001

- Segue o mesmo padrão do `mobi-studio-host`: app Vite + TypeScript
  standalone, sem framework, com testes em Vitest.
- Persistência local via `localStorage` (sem backend, sem banco de dados)
  — coerente com o resto do monorepo, que não tem nenhuma infraestrutura
  de servidor/banco hoje. Se o Gestor precisar ser multiusuário/multi-
  dispositivo mais adiante, isso é uma decisão de arquitetura maior que
  precisa de autorização explícita antes do CP002 ou de quando a
  necessidade aparecer.
- Nenhuma integração externa, nenhuma IA, nenhum upload de arquivo neste
  checkpoint — fora de escopo deliberadamente.

## Suposições assumidas no CP002 (implementado durante a madrugada, sem
## confirmação do Charles — revisar e corrigir o que estiver errado)

- **Um orçamento por projeto.** Não modelei múltiplas propostas/versões de
  orçamento por projeto (renegociação vira só uma edição de status/valor
  do mesmo orçamento, não um histórico de versões). Se o real é "cada
  negociação gera um novo orçamento e o cliente compara", isso precisa
  de outro modelo (lista de orçamentos por projeto, não um só).
- **Margem e comissão são só capturadas, não usadas em nenhum cálculo
  ainda.** Não existe dado de custo (material, mão de obra) no sistema
  pra calcular margem de verdade — o campo é só um número que o
  responsável digita. Cálculo real de margem fica para quando existir
  módulo de custo/produção.
- **"Motivo da perda" usa `window.prompt()`** — uma caixa de diálogo
  nativa do navegador, não um formulário desenhado. Foi a forma mais
  rápida de capturar o dado sem inventar um modal novo às pressas de
  madrugada. Deve ser substituído por um formulário de verdade quando
  o design geral do Gestor for revisado.
- **Conversão/funil não foi implementado** (ex.: relatório de "quantos
  orçamentos viram projeto aprovado"). Só o estado atual é mostrado, sem
  histórico agregado.
- **Moeda fixa em BRL**, sem qualquer configuração.

## CP003a — Importar itens de PDF (implementado 2026-07-16)

Usa `pdfjs-dist` (roda no navegador, carregado sob demanda — não pesa no
carregamento inicial) para extrair texto do PDF **com posição (x,y)**, o
que permite reconstruir linhas corretamente em vez de texto solto sem
ordem (limitação que eu tinha registrado nas notas do PDF da Ana e Bruno,
usando extração sem posição). Um filtro heurístico (maiúsculas, tamanho,
lista de palavras de timbre conhecidas) sinaliza candidatos prováveis, mas
**o usuário sempre revisa e confirma antes de salvar** — nada é criado
automaticamente sem esse passo, seguindo o mesmo padrão de "revisão
humana" já usado no Copilot.

**Resultado real testado** (PDF real da Ana e Bruno, 17 páginas): 195
candidatos, 102 pré-marcados como prováveis. Nomes reais de item saíram
corretos (CRISTALEIRA, BUFFET, RACK, ILHA, ARMÁRIO COZINHA, GAVETEIRO,
SAPATEIRA, CABIDEIRO, QUARTO HELENA, ARMÁRIOS LAVANDERIA...). Ruído
aparece principalmente de texto **rotacionado** no timbre da prancha (meu
agrupamento de linha assume texto horizontal) — visualmente óbvio de
descartar na revisão, mas não é 100% automático.

**Sobre a meta de "90% de taxa de acerto"**: não implementei nenhuma
métrica de precisão automática (exigiria um dataset de verdade rotulado
pra comparar). O que existe é uma ferramenta de extração assistida que
reduziu ~all o trabalho de digitar itens à mão para uma revisão rápida de
checkboxes — não é "automático a 90%", é "muito mais rápido que digitar,
com revisão humana obrigatória". Se a meta original era 100% automático
sem revisão, isso não foi alcançado nem é recomendado (risco de erro
silencioso é alto demais pra pular a revisão).

**Fora de escopo desta fase**: extração de cotas/dimensões associadas a
cada item (só nomes por enquanto), suporte a PDF escaneado/imagem (só
vetorial/texto).

## CP003b — Calculadora de custo real (implementado 2026-07-16, decisão delegada por Charles)

Charles pediu pra eu escolher o melhor caminho. Decidi **não** replicar a
planilha real inteira (ela rateia mão de obra por pessoa e etapa — exigiria
um módulo de funcionários/horas separado, escopo bem maior que um
checkpoint). Em vez disso, uma calculadora simplificada dentro do
Orçamento já existente: `preço = (matéria-prima + mão de obra + custo
fixo) × (1 + markup%)`. É opcional — quem quiser digitar o valor direto
continua podendo, sem usar a calculadora.

**Diferença real vs. planilha da empresa**: a aba `RESULTADO` da planilha
tem um cálculo de despesas mais elaborado (não é só markup linear sobre o
custo total) — o preço de venda calculado por lá pra um custo de 2978 foi
6816,31, não os ~4020 que a minha fórmula simplificada dá pro mesmo custo.
Registrado explicitamente no código e no teste — não é engano, é
simplificação deliberada. Se precisar da fórmula exata depois, é um
próximo checkpoint (CP003c), não uma correção deste.

## CP004 — Produção: fila, etapas, responsável, prioridade (implementado 2026-07-17)

`responsavel` e `prioridade` já existiam no `Projeto` desde o CP001 — o que
faltava era a granularidade de **etapa** dentro do status `PRODUCAO` e uma
visão de fila. Adicionado `etapaProducao` (`FILA` → `CORTE` →
`MONTAGEM_ESTRUTURA` → `ACABAMENTO` → `ENTREGA`), só tem sentido enquanto
`status === "PRODUCAO"`: entrar em produção sempre reinicia em `FILA`; sair
de produção limpa a etapa. Um quadro Kanban (`Produção — fila de trabalho`)
mostra os projetos em produção agrupados por etapa, ordenados por
prioridade (ALTA primeiro), com um seletor pra avançar a etapa direto do
card. O painel de atenção (`AtencaoEngine`) agora menciona a etapa quando
um projeto parado está em produção — reaproveita a mesma regra de "7+ dias
sem atualização" que já existia, sem lógica nova de atraso.

**Fora de escopo deliberadamente**: reordenar manualmente dentro da mesma
etapa (a ordem é só por prioridade + tempo parado, não é arrastável), e
qualquer noção de capacidade/carga de trabalho por responsável — isso seria
CP006 ou além, precisa de dado que não existe ainda (quanto tempo cada
etapa realmente leva).

## CP005 — Fechamento do projeto: custo estimado x real (implementado 2026-07-17)

Nasceu de uma conversa com Charles sobre a visão de longo prazo da
plataforma (ver `docs/VISAO_FUTURA_PLATAFORMA_MOBI.md`): um sistema que
aprende de dado real, não de estimativa. Pra isso, precisava de um jeito
formal de comparar o que foi vendido/estimado contra o que realmente
aconteceu, e de registrar por que a diferença existiu.

Dois conceitos novos:

- **`Orcamento.custoRealTotal` + `Orcamento.fechadoEm`** — só preenchido
  uma vez, quando o orçamento está `APROVADO`, via
  `OrcamentoRepository.registrarFechamento`. É **imutável** depois de
  registrado (o repositório recusa um segundo `registrarFechamento` no
  mesmo orçamento) — é o "dado real congelado" que a visão futura pede.
  `compararFechamento()` calcula a diferença contra o custo estimado
  (soma MP+MO+Fixo quando a calculadora do CP003b foi usada, ou o `valor`
  direto quando não foi).
- **`MudancaEscopo`** — log de eventos durante a execução do projeto, com
  **categoria fixa** (`CLIENTE_ADICIONOU`, `CLIENTE_REMOVEU`,
  `CLIENTE_TROCOU_MATERIAL`, `MEDIDA_DIVERGENTE`, `OUTRO`) em vez de texto
  livre — mesma disciplina de "poucos tipos reutilizáveis" da Biblioteca
  Oficial do Origin, necessária pra dar pra agregar estatisticamente mais
  tarde.

Na tela: com o orçamento `APROVADO` e ainda não fechado, aparece um
formulário de fechamento (custo real) e um log de mudança de escopo
editável. Depois de fechado, vira um resumo só-leitura: "Estimado: X ·
Real: Y · Diferença: +Z (N mudanças de escopo)".

**Fora de escopo deliberadamente**: nenhuma lógica de "aprendizado" em
cima desses dados ainda — isso exigiria dezenas de projetos fechados
nesse formato antes de fazer sentido (ver seção de sugestões do documento
de visão futura). Este checkpoint só cria a estrutura de dado; a análise
vem depois, quando existir volume. Também não existe ainda comparação de
**prazo** (só custo) — `Projeto` não tem campo de prazo planejado, seria
extensão de um checkpoint futuro.

## CP006 — Compras e estoque: itens faltantes, entrada/saída (implementado 2026-07-24)

Depois da homologação humana de CP001-CP005 (roteiro
`03_MOBI_PLATFORM/testes/gestor_homologacao/ROTEIRO_TESTE_GESTOR.md`
concluído por Charles), CP006 é o próximo item não iniciado do roadmap.

**Decisão de escopo confirmada com Charles antes de implementar**:
estoque é um domínio **próprio**, com quantidade mínima — não depende de
estender `ItemLevantamento` (que hoje só guarda nome, sem quantidade;
juntar os dois fica pra um checkpoint futuro se fizer sentido). "Itens
faltantes" = itens com `quantidadeAtual` abaixo de `quantidadeMinima`.

Dois conceitos novos em `GestorTypes.ts`:

- **`ItemEstoque`** — `nome`, `unidade`, `quantidadeAtual` (sempre
  começa em 0, só muda via movimento), `quantidadeMinima`.
- **`MovimentoEstoque`** — log append-only de `ENTRADA`/`SAIDA`, com
  `quantidade` sempre positiva (o `tipo` é quem dá o sinal),
  `projetoId` opcional (saída pode ou não estar vinculada a um
  projeto) e `motivo` livre.

`ItemEstoqueRepository.registrarMovimento` orquestra os dois
repositórios (item + movimento) numa única chamada: atualiza
`quantidadeAtual` e grava o `MovimentoEstoque` juntos. Mesmo idioma de
guarda já usado em `OrcamentoRepository.registrarFechamento` — a regra
de negócio (aqui: "SAIDA não pode deixar quantidade negativa") vive
inteira no predicado passado a `LocalStore.update()`; se não bate, `null`
é devolvido e **nada muda**, nem o item nem o movimento é criado.

`AtencaoEngine.computeAtencao` ganhou um terceiro parâmetro opcional
(`itensEstoque`, default `[]` — mantém compatibilidade com as chamadas
existentes) que adiciona um item de atenção `warning` por item abaixo do
mínimo, reaproveitando o mesmo shape `ItemAtencao` (o campo `projetoId`
carrega o id do `ItemEstoque` nesse caso — é uma lista única de
atenção, não dois painéis separados).

UI: nova seção "Compras e estoque" em `App.ts` (`renderEstoque`/
`renderItemEstoque`), mesmo padrão de formulário+lista das outras
seções — cadastro de item, e por item um mini-formulário de
entrada/saída com quantidade, projeto opcional e motivo.

**Testado manualmente no navegador** (não só testes automatizados):
criar item, entrada soma corretamente, saída válida subtrai, saída
maior que o estoque é bloqueada com alerta claro e **não altera nada**
(confirmado via inspeção direta do DOM antes/depois), item aparece no
painel de atenção quando abaixo do mínimo e some quando normaliza.

**Revisão de escopo (Charles, 24/07/2026, mesmo dia)**: depois da
primeira versão, Charles pediu 2 ajustes que já foram implementados —
(1) `fornecedor` e `precoUnitario` em toda ENTRADA (é uma compra,
precisa saber de quem e por quanto); (2) `projetoId` obrigatório em
toda SAÍDA (antes era opcional). Saída continua sendo só rastreio —
não desconta orçamento nem afeta o custo real fechado do CP005,
confirmado explicitamente ("só rastreio").

**Fora de escopo deliberadamente**: pedido de compra formal (só
registra a compra já feita, não um fluxo de aprovação); vínculo com
`ItemLevantamento`/BOM do projeto; múltiplos depósitos/localizações
(um estoque só, global).

**Padrão de uso confirmado com Charles (24/07/2026)**: ferragens (padrão
da marcenaria — dobradiça, puxador, parafuso...) usam **1 item de
estoque compartilhado**, quantidade global — é assim que o CP006 já
funciona. **MDF é por cliente** — não por mudança de código, mas de
convenção de cadastro: cada combinação material+cliente vira seu
próprio `ItemEstoque` (ex.: "MDF Branco 15mm — Torres" e "MDF Branco
15mm — Ana e Bruno" são dois itens distintos, cada um com sua própria
quantidade/mínimo). O modelo de dado já suporta isso sem nenhuma
alteração — só decisão de nomenclatura na hora de cadastrar.
