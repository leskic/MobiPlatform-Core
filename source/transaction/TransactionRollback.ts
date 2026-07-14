import type { MobiOrigin } from "../origin/MobiOrigin";

export class TransactionRollback {
  capture(origin: MobiOrigin): string { return JSON.stringify(origin.getProject()); }
  restore(origin: MobiOrigin, snapshot: string): void { origin.openProject(snapshot); }
}
