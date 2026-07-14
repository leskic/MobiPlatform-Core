import type { StudioLayout } from "./StudioLayout"; export class StudioWorkspace { constructor(readonly layout: StudioLayout) {} get() { return this.layout.get(); } }
