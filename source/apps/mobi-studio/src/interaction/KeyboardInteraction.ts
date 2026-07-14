import type { StudioCommandName } from "../interfaces/StudioApplicationTypes"; import type { ShortcutRegistry } from "./ShortcutRegistry";
export class KeyboardInteraction { constructor(private readonly shortcuts: ShortcutRegistry) {} commandFor(key: string): StudioCommandName | undefined { return this.shortcuts.resolve(key); } }
