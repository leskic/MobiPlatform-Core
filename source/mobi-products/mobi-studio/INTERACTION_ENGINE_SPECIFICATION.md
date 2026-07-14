# Interaction Engine Specification

Estados: IDLE, PREVIEW e EXECUTING. Canvas/UI produzem InteractionInput; IntentFactory produz intent; SelectionIntent é somente visual; intents mutáveis abrem preview antes de commit. Interações concorrentes e atualizações com IntentID divergente são bloqueadas. Cancelamento executa rollback visual imediato.
