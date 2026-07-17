# Atualizações Diárias

Caixa de entrada compartilhada, via git, pra atualizações que qualquer
IA (Work, e quando ativa a Janaína) deixar sobre o que fez no dia — sem
depender de Charles copiar/colar entre chats ou soltar zip no inbox
local. Diferente de `COORDENACAO/TESTES_RESULTADOS/` (que é sobre teste
humano real): esta pasta é sobre o que cada frente **fez/entregou**, não
sobre o que foi confirmado testando.

## Fluxo

1. Cada IA escreve um arquivo novo em `PENDENTE/`, nome
   `AAAA-MM-DD_<AUTOR>_<TITULO_CURTO>.md` (ex.:
   `2026-07-18_WORK_HOTFIX007_ANCHOR_CALIBRATION.md`).
2. Charles avisa o Claude Code pra conferir.
3. Claude Code lê cada arquivo em `PENDENTE/`, confere contra o código
   real quando aplicável (mesma regra de sempre — narração não é
   confirmação), e decide:
   - **Relevante pro projeto agora**: o arquivo permanece em `PENDENTE/`
     (ou é referenciado em `COORDENACAO/STATUS.md` /
     `TESTES_RESULTADOS/`, se virar um checkpoint de verdade), e some
     dessa fila de triagem.
   - **Não relevante agora** (fora de escopo, duplicado, prematuro,
     descontinuado): move pra `TRANCADO/`, com uma linha no topo do
     arquivo explicando o motivo. Nunca apaga — só arquiva.

## Regra: TRANCADO não é lixo

Arquivo trancado pode voltar a ser relevante depois (ex.: uma proposta
de feature que só fica pra depois do CP004 fechar). Trancar é "não agora
por este motivo", não "descartado pra sempre".
