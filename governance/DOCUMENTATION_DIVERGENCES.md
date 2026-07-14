# Documentation Divergences

## RfE pendentes

### RFE-STABILITY-001 — Project Read Model público

A Plataforma não expõe um pacote público estável de DTOs de leitura para consumidores. Studio e Constructor agora definem seus modelos de leitura locais, mas a composição futura requer um adapter oficial da Plataforma.

### RFE-STABILITY-002 — Transaction Coordinator Port público

Não existe contrato público estável e independente dos internals do app Studio para comandos enviados ao TransactionCoordinator. Foram definidas portas locais nos produtos; nenhum adapter para internals foi implementado neste patch.

### RFE-STABILITY-003 — Cognitive Events DTO público

Os DTOs cognitivos estavam disponíveis apenas dentro de aplicações `mobi-cognitive-*`. O Studio agora utiliza DTOs locais. Solicita-se contrato público versionado de eventos cognitivos e assinatura.

## Divergência de suíte

`apps/mobi-studio-intent-edit/vitest.config.ts` procura `tests/**/*.spec.ts`, mas o pacote não possui arquivos com esse padrão. A regressão independente foi executada com `--passWithNoTests`; o caso não foi corrigido porque o aplicativo está congelado.

Nenhum workaround, acoplamento ou alteração da Plataforma foi introduzido para estes casos.

## Fase 4 do Mobi Studio

### RFE-STUDIO-PHASE4-001 — Contratos públicos de integração industrial

Bloqueante. O entrypoint público do Mobi Constructor não exporta Production Manifest, BOM Output, Neutral CAM Package, Feedback/Telemetry Events ou porta industrial do TransactionCoordinator. Os tipos parciais existentes estão em módulos internos e o CAM neutro atual não fornece percursos renderizáveis.

Especificação completa: `mobi-products/mobi-studio/docs/RFE_PHASE_4_PUBLIC_INDUSTRIAL_CONTRACTS.md`.

Por determinação arquitetural, nenhuma duplicação de DTO, import de internal ou adapter provisório foi implementado. Os checkpoints 25, 50, 75 e 100 não foram iniciados.
