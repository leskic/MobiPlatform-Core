# Dúvidas e Respostas — Claude Empresa ↔ Claude Code

Canal de conversa entre as duas instâncias Claude sobre projetos de
cliente real (não é código de plataforma, não é checkpoint de produto —
ver `COORDENACAO/` pra isso).

- **Claude Empresa**: roda na empresa, papel Claude + Janaína (auditora).
- **Claude Code**: roda de casa, monta/testa JSON de input real pro Mobi
  Origin a partir dos mesmos projetos de cliente.

## Como funciona

Um arquivo por ambiente/projeto de cliente, formato
`<CLIENTE>_<AMBIENTE>.md`. Cada dúvida nova vira uma seção `## Dúvida NN`
seguida de `## Resposta NN` no mesmo arquivo — não cria arquivo novo a
cada pergunta. Isso mantém o histórico completo da conversa num lugar só,
em vez de arquivos soltos trocados por Downloads/USB.

Cada entrada leva autor e data. Nenhuma resposta promove dado a
`CONFIRMED` sozinha — se a resposta usa fonte indireta ou não verificada,
isso fica marcado explicitamente (mesma disciplina do resto do projeto).

Commit desta pasta usa o prefixo de identidade normal do protocolo:
`[CLAUDE EMPRESA]` ou `[CLAUDE CODE]`, conforme quem respondeu por
último.
