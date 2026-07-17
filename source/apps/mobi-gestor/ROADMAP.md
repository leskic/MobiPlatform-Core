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
| CP004 | Produção: fila, etapas, responsável, prioridade | Não iniciado |
| CP005 | Compras e estoque: itens faltantes, entrada/saída | Não iniciado |
| CP006 | Financeiro: valor vendido, custos, fluxo de caixa | Não iniciado |
| CP007 | Indicadores/KPIs: setor atrasando, ranking, tempo médio | Não iniciado |
| CP008+ | Integrações externas (WhatsApp, ERP, ferramentas de corte, Power BI) e IA (perguntas em linguagem natural, sugestões) | Não iniciado — cada integração precisa de checkpoint próprio, credenciais e decisão de arquitetura separada |
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
