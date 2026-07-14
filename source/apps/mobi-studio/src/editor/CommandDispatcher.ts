import type { MobiStudio } from "../../../../studio/MobiStudio"; import type { PresentationCore } from "../../../../presentation/PresentationCore"; import type { EditorController } from "./EditorController"; import type { StudioCommand, StudioCommandName } from "../interfaces/StudioApplicationTypes";
export class CommandDispatcher {
  private logicalTimestamp = 0;
  constructor(private readonly foundation: MobiStudio, private readonly presentation: PresentationCore, private readonly editor: EditorController) {}
  dispatch(command: StudioCommand): unknown {
    switch (command.name) {
      case "open-project": return this.foundation.openProject(String(command.payload));
      case "save-project": return this.foundation.saveProject();
      case "close-project": return this.foundation.closeProject();
      case "select": this.presentation.repository.selection.select(String(command.payload)); this.notify("SelectionChanged"); return undefined;
      case "clear-selection": this.presentation.repository.selection.clear(); this.notify("SelectionChanged"); return undefined;
      case "hide": this.presentation.repository.visibility.hide(String(command.payload)); this.notify("VisibilityChanged"); return undefined;
      case "show": this.presentation.repository.visibility.show(String(command.payload)); this.notify("VisibilityChanged"); return undefined;
      case "isolate": this.presentation.repository.visibility.isolate(Array.isArray(command.payload) ? command.payload.map(String) : [String(command.payload)]); this.notify("VisibilityChanged"); return undefined;
      case "restore-visibility": this.presentation.repository.visibility.restore(); this.notify("VisibilityChanged"); return undefined;
      case "cancel-edit": return this.editor.cancel();
      case "commit-edit": return this.editor.commit();
      case "publish-navigable-project-placeholder": return "NOT_IMPLEMENTED";
      case "undo-placeholder": case "redo-placeholder": return "NOT_IMPLEMENTED";
      case "new-project": return "REQUIRES_PROJECT_INPUT";
      default: return this.assertNever(command.name);
    }
  }
  private assertNever(value: never): never { throw new Error(`Unsupported command: ${String(value)}`); }
  private notify(type: "SelectionChanged" | "VisibilityChanged"): void { this.presentation.controller.notify(type, this.logicalTimestamp++); }
}
