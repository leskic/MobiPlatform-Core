# Feedback Loop Specification

Logs aceitos: STARTED, COMPLETED e REJECTED, sempre com ID, PartID e timestamp lógico. Telemetria exige métrica, valor finito e unidade. IDs duplicados, PartIDs desconhecidos, dimensões inválidas e timestamps inválidos são bloqueados. Toda ingestão retorna snapshot defensivo e mapa PartID → registros; nenhum estado produtivo é confirmado ou escrito.
