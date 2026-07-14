import type { StudioSessionSnapshot } from "./types/StudioTypes";

export class StudioSession {
  private id: string | undefined;

  create(id: string): StudioSessionSnapshot {
    this.id = id;
    return this.get();
  }

  get(): StudioSessionSnapshot {
    return { id: this.id ?? "", active: this.id !== undefined };
  }

  has(): boolean {
    return this.id !== undefined;
  }
}
