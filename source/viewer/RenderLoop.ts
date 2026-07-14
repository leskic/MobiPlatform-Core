import type { FrameScheduler } from "./interfaces/ViewerTypes";

export class RenderLoop {
  private handle: unknown; private requested = false;
  constructor(private readonly scheduler: FrameScheduler, private readonly render: () => void) {}
  request(): void { if (this.requested) return; this.requested = true; this.handle = this.scheduler.request(() => { this.requested = false; this.handle = undefined; this.render(); }); }
  cancel(): void { if (!this.requested) return; this.scheduler.cancel(this.handle); this.requested = false; this.handle = undefined; }
  isPending(): boolean { return this.requested; }
}
