import type { PresentationCore } from "../../../../presentation/PresentationCore";
import type { Suggestion } from "../../../../copilot/Suggestion";
import type { TransactionOperation, TransactionResultSnapshot } from "../../../../transaction/interfaces/TransactionTypes";

export type ThemeName = "light" | "dark";
export type DockArea = "left" | "center" | "right" | "bottom";
export type StudioCommandName = "new-project" | "open-project" | "save-project" | "close-project" | "undo-placeholder" | "redo-placeholder" | "select" | "clear-selection" | "hide" | "show" | "isolate" | "restore-visibility" | "cancel-edit" | "commit-edit" | "publish-navigable-project-placeholder";
export type StudioApplicationEventType = "SESSION_STARTED" | "SESSION_ENDED" | "SELECTION_CHANGED" | "PREVIEW_STARTED" | "PREVIEW_CANCELLED" | "TRANSACTION_COMMITTED" | "TRANSACTION_ROLLED_BACK" | "THEME_CHANGED" | "COMMAND_EXECUTED";
export interface StudioApplicationEventSnapshot { type: StudioApplicationEventType; logicalTimestamp: number; detail?: string }
export type StudioApplicationListener = (event: StudioApplicationEventSnapshot) => void;
export interface EditPreviewInput { apply(presentation: PresentationCore): void; revert(presentation: PresentationCore): void }
export interface EditIntentInput { id: string; entityId: string; property: string; value: unknown; author: string; logicalTimestamp: number; operationName: string; operation: TransactionOperation; preview: EditPreviewInput }
export interface EditIntentSnapshot { id: string; entityId: string; property: string; value: unknown; author: string; logicalTimestamp: number; operationName: string }
export interface TransactionFeedbackSnapshot { transactionId: string; status: "IDLE" | "COMMITTED" | "ROLLED_BACK"; message: string | null; result?: TransactionResultSnapshot }
export interface StudioApplicationSnapshot { sessionId: string | null; active: boolean; selectedIds: string[]; editing: boolean; theme: ThemeName; status: string; transaction: TransactionFeedbackSnapshot }
export interface StudioCommand { name: StudioCommandName; payload?: unknown }
export interface TreeNodeView { id: string; label: string; category: string; children: TreeNodeView[] }
export interface PropertyRow { name: string; value: unknown; editable: boolean }
export interface DockSnapshot { panels: Record<string, DockArea>; visible: Record<string, boolean> }
export interface StudioShellSnapshot { menu: string[]; toolbar: string[]; layout: Record<DockArea, string[]>; theme: ThemeName }
export interface CopilotPanelSnapshot { suggestions: Array<{ code: string; severity: string; path: string; message: string }> }
export type SuggestionSource = readonly Suggestion[];
