import type { Project } from "../builder/types/ProjectTypes";
import { MobiOrigin } from "../origin/MobiOrigin";
import { StudioApplication } from "./StudioApplication";
import type {
  StudioEvent, StudioListener, StudioSessionSnapshot, StudioStateSnapshot
} from "./types/StudioTypes";

export class MobiStudio {
  private readonly application: StudioApplication;

  constructor(origin = new MobiOrigin()) {
    this.application = new StudioApplication(origin);
  }

  createSession(id: string): StudioSessionSnapshot { return this.application.createSession(id); }
  openProject(input: string): Project { return this.application.openProject(input); }
  saveProject(): string { return this.application.saveProject(); }
  closeProject(): void { this.application.closeProject(); }
  getProject(): Project { return this.application.getProject(); }
  getState(): StudioStateSnapshot { return this.application.getState(); }
  subscribe(listener: StudioListener): void { this.application.subscribe(listener); }
  unsubscribe(listener: StudioListener): void { this.application.unsubscribe(listener); }
  notify(event: StudioEvent): void { this.application.notify(event); }
}
