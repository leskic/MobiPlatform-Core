import type { SynchronizationMode, SynchronizationPlan } from "../interfaces/MobiDinaTypes";
export class SyncPlanner { plan(mode: SynchronizationMode): SynchronizationPlan { return { mode, requiresConfirmation: true, steps: ["ADAPT", "ANALYZE", "CONFIRM", "TRANSACT", "VERIFY"] }; } }
