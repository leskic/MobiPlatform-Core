# File Inventory

## Estrutura do backup

| Área | Conteúdo |
|---|---|
| `source/` | código, testes, manifests, lockfile, configs e documentação da baseline atual |
| `governance/` | arquitetura, fronteiras, Golden Rules, schema Projeto.mobi e MIC |
| `checkpoints/` | checkpoints históricos disponíveis e artefatos do CP001 |
| `rfe/` | RfEs disponíveis, aprovação e autorização de retomada |
| `reports/` | cópias dos IMPLEMENTATION_REPORTs e ARCHITECT_HANDOFFs existentes |
| `evidence/` | outputs brutos de build/testes e manifests de hashes anteriores |
| `recovery/` | reservado para artefatos auxiliares de recuperação; instrução canônica está em `RECOVERY.md` |

## Principais áreas do source

| Área real | Função |
|---|---|
| `apps/` | aplicações da Plataforma e Products Layer existentes |
| `builder/` | construção oficial do Projeto.mobi |
| `codec/` | parse e serialização do Projeto.mobi |
| `validator/` | schema e validação |
| `origin/`, `transaction/`, `presentation/`, `viewer/` | componentes congelados da Foundation |
| `copilot/` | regras e pacotes cognitivos existentes |
| `mobi-products/mobi-constructor/` | Constructor, MIC e fluxo público CP001 |
| `mobi-products/mobi-studio/` | Studio consolidado disponível |
| `mobi-products/mobi-levantamento/` | produtor oficial do CP001 |
| `mobi-products/mobi-view/` | integração pública read-only do CP001 |
| `platform-extensions/mobi-platform-chain-v1/` | contratos e adapter público versionados |
| `checkpoints/` | checkpoints anteriores disponíveis |

## Congelado

Constituição e Foundation são consideradas congeladas. No source, isso inclui ao menos `origin/`, `transaction/`, `presentation/`, `viewer/`, schema/validator e componentes históricos de `apps/` não autorizados pelo CP001.

## Modificável neste estado

Nenhuma área está autorizada para nova modificação antes da homologação humana. A implementação CP001 está concluída, mas ainda não congelada.

## Artefatos gerados

- outputs brutos `CHECKPOINT_001_*_OUTPUT.txt`;
- manifests/checksums;
- relatórios e handoffs;
- este backup e seu ZIP.

## Ausências relevantes

- não existe pasta real `packages/` na baseline atual;
- não existe pasta real denominada `foundation/`; os componentes da Foundation estão distribuídos nas áreas descritas;
- não foram encontrados documentos independentes com os nomes literais `CONSTITUTION.md`, `EXECUTION_MODE_V3.md`, `GOLDEN_RULE.md`, `BUILD_REPORT.md`, `TEST_REPORT.md`, `REVIEW_REPORT.md`, `FREEZE_REPORT.md`, `KNOWN_ISSUES.md` ou `CHANGELOG.md`;
- Golden Rules existem como código em `governance/golden-rules/GoldenRules.ts`;
- evidências de build/testes existem como outputs brutos, não como relatórios com nomes genéricos;
- não há branch, commit ou remote Git registrados na baseline independente;
- credenciais e configuração externa não são incluídas.

