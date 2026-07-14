export class StudioToolbar { readonly items = ["undo-placeholder", "redo-placeholder", "select", "hide", "isolate", "restore-visibility"] as const; get(): string[] { return [...this.items]; } }
