# Baseline Validation

Baseline reconstruída com Mobi G-Code Foundation v1, Spatial Tools Fase 1, Product Parameterization Fase 2 e Intent-Edit Extension oficial.

- Instalação pelo lockfile: 137 pacotes.
- Foundation: build strict aprovado; 313/313 testes em 32 arquivos.
- Intent-Edit: build aprovado; 14/14 testes; cobertura acima de 95% em todas as métricas.
- Grain: build aprovado; 9/9 testes.
- Fase 1: 36/36 testes oficiais.
- Fase 2: 34/34 testes oficiais.
- Imports quebrados: nenhum.
- Fase 3.1: build strict aprovado; 31/31 testes; cobertura por app acima de 95% em todas as métricas.
- Regressão consolidada: 428/428 testes executados.
- Integridade: 630 arquivos preexistentes conferidos por SHA-256, sem divergências.
- Fase 3.2: build strict aprovado; 28/28 testes; 100% statements/lines/functions e 97,29% branches.
- Regressão após Openings: 456/456 testes executados (Foundation 313, Products congelados 84, Fase 3.1 31, Fase 3.2 28).
- Integridade pré-documentação da Fase 3.2: 664/664 arquivos da baseline 3.1 conferidos por SHA-256, sem divergências.
- Fase 3.3: build strict aprovado; 49/49 testes focados.
- Cobertura Technical Points: 100% statements, 96,66% branches, 100% functions e lines.
- Cobertura Appliances/Collision: 100% statements, 95,32% branches, 100% functions e lines.
- Regressão final do Contexto Ambiental: 505/505 testes executados.
- Integridade pré-documentação da Fase 3.3: 688/688 arquivos da baseline 3.2 conferidos por SHA-256.
- Fase 4.1: build strict aprovado; Analyzer 9/9 e UI 7/7 testes.
- Cobertura Analyzer: 100% statements/functions/lines e 95,50% branches.
- Cobertura Cognitive UI: 100% em todas as métricas.
- Regressão consolidada após Cognitive Layer: 521/521 testes.
- Integridade pré-documentação da Fase 4.1: 725/725 arquivos da baseline 3.3 conferidos por SHA-256.
- Fase 4.2: build strict aprovado; 22/22 testes.
- Cobertura Proposition Engine: 100% statements/functions/lines e 97,01% branches.
- Regressão consolidada após Proposition Engine: 543/543 testes.
- Integridade pré-documentação da Fase 4.2: 770/770 arquivos da baseline 4.1 conferidos por SHA-256.
- Verificação estática: zero referências proibidas no source do engine.

Componentes congelados comparados: Validator, Builder, Codec, Origin, Studio Foundation/Application, Copilot, RuleSet, RuleBook, Bridge, Sync Manager, Sync Orchestrator, Transaction Engine, Presentation Core, Viewer, Constructor, Detalhamento, Manufacturing, CAM, G-Code, Intent-Edit e Products Layer Fases 1 e 2.
# Phase 4.3 validation

Antes de atualizar os documentos de entrega, os 794 arquivos da baseline oficial 4.2 foram validados por SHA-256 sem divergências. O app Auto-Fix foi adicionado isoladamente. Build/strict, 557 testes consolidados e cobertura específica 100/97,7/100/100 foram aprovados.

# Stability Patch validation

- ZIP baseline: SHA-256 `b05de215b9f42976abface0d1e2f38810a0db47612d7ef730ee485e8ebbf78e4`.
- Inventário baseline: 1231 arquivos; manifesto SHA-256 `3431212b0adb2276bc6b04ad841b47d282bca398c71bf1d842e4d1cdfdcb37aa`.
- Componentes fora de `mobi-products`: 862/862 hashes verificados sem divergências antes da atualização dos documentos de entrega.
- Build e TypeScript strict: aprovados para Plataforma, Studio e Constructor.
- Matriz final: 313/313 baseline, 230/230 apps independentes, 37/37 Studio e 32/32 Constructor.
- Imports cruzados: zero.
- Digest final de fontes e testes dos produtos: `505bde1105d887bd1b08bcc42156767b4df456c9eb2786106df87e0846247423`.
