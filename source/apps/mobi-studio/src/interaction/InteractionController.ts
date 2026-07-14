import type { KeyboardInteraction } from "./KeyboardInteraction"; import type { PointerInteraction } from "./PointerInteraction"; import type { SelectionInteraction } from "./SelectionInteraction";
export class InteractionController { constructor(readonly keyboard: KeyboardInteraction, readonly pointer: PointerInteraction, readonly selection: SelectionInteraction) {} }
