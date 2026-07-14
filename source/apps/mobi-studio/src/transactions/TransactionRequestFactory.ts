import type { TransactionRequestSnapshot } from "../../../../orchestrator/interfaces/OrchestratorTypes";
import type { EditIntent } from "../editor/EditIntent";
export class TransactionRequestFactory { create(intent: EditIntent): TransactionRequestSnapshot { const value = intent.get(); return { id: value.id, entity: value.entityId, source: "mobi-studio", destination: "mobi-origin", strategy: "ACCEPT_INTERNAL", status: "PREPARED", logicalTimestamp: value.logicalTimestamp, sourceFingerprint: `preview:${value.id}`, destinationFingerprint: `origin:${value.entityId}` }; } }
