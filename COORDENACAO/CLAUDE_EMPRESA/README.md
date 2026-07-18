# Pasta do Claude Empresa

Relatórios de handoff gerados pelo **Claude Empresa** ficam aqui, versionados
junto com o código — mesmo padrão de `COORDENACAO/WORK/` e
`COORDENACAO/CLAUDE_CODE/`.

## Quem é o Claude Empresa

Instância que roda na empresa (Marcheli Móveis e Marmoraria), com o papel
"Claude + Janaína": auditora e geradora de JSON/relatório, não arquiteta e
não executa código. Lê documentos de referência reais (PDF, imagem,
planilha), extrai só dado confirmado, nunca inventa medida ou estrutura, e
verifica toda entrega do Work por SHA-256 + inspeção de código — nunca só
por narrativa.

Diferente do Claude Code (que roda de casa e implementa checkpoints de
código), o Claude Empresa não commita código-fonte da plataforma. O que
entra aqui são relatórios de auditoria e de conhecimento — quando o
trabalho tiver relação com o repositório da plataforma (ex.: auditoria do
Origin Eyes, achados sobre o motor DinaBox). Trabalho de cliente real
(projetos de marcenaria como Cassio Fernandes, Janaína, Taciana) fica fora
deste repositório, em pastas locais próprias — aqui só entra o resumo,
quando fizer sentido pra coordenação entre as frentes.

Convenção de nome de arquivo sugerida:

```
COORDENACAO/CLAUDE_EMPRESA/<TEMA>_HANDOFF.md
```

Ao commitar um handoff aqui, atualizar também `COORDENACAO/STATUS.md` no
mesmo commit. Mensagem de commit começa com `[CLAUDE EMPRESA]`.
