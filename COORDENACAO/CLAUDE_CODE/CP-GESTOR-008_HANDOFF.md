# CP008 Mobi Gestor Indicadores — Handoff — Claude Code

Branch: `checkpoint/cp-gestor-008-indicadores` (baseada em
`checkpoint/cp-gestor-007-financeiro`, working tree limpo)

## Contexto

CP007 (Financeiro) fechado e revisado. Charles pediu pra seguir pro
próximo item do roadmap. Antes de implementar, perguntei os 3 pontos
que o nome do checkpoint deixava em aberto (cada um tinha múltiplas
leituras possíveis) — decisões abaixo.

## Escopo implementado

- `IndicadoresEngine.ts` (funções puras, mesmo padrão de
  `AtencaoEngine.ts`/`FinanceiroEngine.ts`): `etapasAtrasadas`,
  `rankingResponsaveis`, `tempoMedioFechamentoDias`.
- **Setor atrasando** = por etapa de produção, mesmo critério de
  "parado" já usado no painel de atenção (`DIAS_PARADO_LIMITE`).
  Mostra as 5 etapas sempre, com 0 onde não há atraso.
- **Ranking** = responsável por projetos `CONCLUIDO`, ordenado
  decrescente.
- **Tempo médio** = dias entre `Projeto.criadoEm` e
  `Orcamento.fechadoEm`, média sobre todos os orçamentos fechados com
  projeto ainda existente (órfão é ignorado, não quebra).
- Nova seção "Indicadores" na UI: lista de etapas, ranking numerado,
  1 stat de tempo médio. Só leitura, sem formulário novo.

## Suposições que PRECISAM da sua revisão

1. **"Setor atrasando" é por etapa de produção**, não por
   responsável — se você queria ver "quem" está com mais atraso em vez
   de "onde" no processo, é modelo de agrupamento diferente (pequena
   mudança, já tenho os dois critérios prontos no `AtencaoEngine`).
2. **Ranking é só de responsável por concluídos** — não fiz ranking de
   cliente por valor vendido (era a outra opção que te mostrei). Se
   quiser os dois, é uma função nova simples de adicionar.
3. **Tempo médio é do início ao fechamento geral**, não por etapa de
   produção — o sistema não guarda quando cada etapa começou/terminou,
   só a atual. Se isso for importante, precisa de um campo novo
   (histórico de transição de etapa), é mudança de modelo de dado,
   não só cálculo.

## Validação

- Testes novos (`tests/indicadores.test.ts`): 9/9.
- Suite completa do app: 84/84 (nenhuma regressão).
- `tsc --noEmit`: limpo (strict).
- `npm run build`: limpo.
- **Testado ao vivo no navegador**, com manipulação direta do
  `localStorage` pra simular datas que não dava pra esperar de
  verdade (projeto parado há 10 dias, projeto criado há 20 dias):
  confirmei "Corte: 1" depois de mover um projeto pra Produção/Corte e
  backdatar `atualizadoEm`; confirmei ranking "Bruno 1 / Ana 1" depois
  de concluir dois projetos de responsáveis diferentes; confirmei
  "20 dias" de tempo médio depois de backdatar `criadoEm` e fechar o
  orçamento — bateu exato com a conta manual. Servidor parado depois
  do teste.

## Status

READY_FOR_TECHNICAL_REVIEW. Aguardando sua revisão das 3 suposições
acima antes de qualquer freeze ou avanço pro CP009.
