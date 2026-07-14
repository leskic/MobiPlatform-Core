# Request for Extension — TransactionCoordinator Undo/Redo

## Contrato ausente

O TransactionCoordinator público expõe apenas `execute(EditIntent)`. Não existe método público para solicitar Undo ou Redo sem acessar Transaction Engine diretamente.

## Extensão solicitada

Adicionar comandos públicos `requestUndo(metadata)` e `requestRedo(metadata)` ao TransactionCoordinator, preservando atomicidade, eventos e autoridade do pipeline oficial.

## Estado nesta fase

Nenhum workaround foi implementado. Chamadas de integração retornam `RFE_REQUIRED` e nenhuma pilha local é mantida.
