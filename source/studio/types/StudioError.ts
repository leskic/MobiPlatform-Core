export class StudioError extends Error {
  readonly code = "NO_ACTIVE_SESSION";

  constructor() {
    super("No active Studio session");
    this.name = "StudioError";
  }
}
