import type { Project } from "../builder/types/ProjectTypes";
import { MobiOrigin } from "../origin/MobiOrigin";
import { StudioEvents } from "./StudioEvents";
import { StudioSession } from "./StudioSession";
import { StudioState } from "./StudioState";
import type {
  StudioEvent, StudioListener, StudioSessionSnapshot, StudioStateSnapshot
} from "./types/StudioTypes";
import { StudioError } from "./types/StudioError";

export class StudioApplication {
  constructor(
    private readonly origin: MobiOrigin,
    private readonly session = new StudioSession(),
    private readonly state = new StudioState(),
    private readonly events = new StudioEvents()
  ) {}

  createSession(id: string): StudioSessionSnapshot {
    const created = this.session.create(id);
    this.origin.clearProject();
    this.state.setSession(id);
    this.emit("session-created");
    return structuredClone(created);
  }

  openProject(input: string): Project {
    this.requireSession();
    const project = this.origin.openProject(input);
    this.state.setProject(project.id);
    this.emit("project-opened");
    return this.origin.getProject();
  }

  saveProject(): string {
    this.requireSession();
    const serialized = this.origin.saveProject();
    this.emit("project-saved");
    return serialized;
  }

  closeProject(): void {
    this.requireSession();
    this.origin.closeProject();
    this.state.clearProject();
    this.emit("project-closed");
  }

  getProject(): Project {
    this.requireSession();
    return this.origin.getProject();
  }

  getState(): StudioStateSnapshot {
    return structuredClone(this.state.get());
  }

  subscribe(listener: StudioListener): void {
    this.events.subscribe(listener);
  }

  unsubscribe(listener: StudioListener): void {
    this.events.unsubscribe(listener);
  }

  notify(event: StudioEvent): void {
    this.events.notify(event);
  }

  private emit(type: StudioEvent["type"]): void {
    this.events.notify({ type, state: this.state.get() });
  }

  private requireSession(): void {
    if (!this.session.has()) throw new StudioError();
  }
}
