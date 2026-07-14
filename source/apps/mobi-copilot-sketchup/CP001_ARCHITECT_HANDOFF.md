# Mobi Copilot CP001 Architect Handoff

## Human Test Script

1. Open the repository delivery.
2. Copy `source/apps/mobi-copilot-sketchup/mobi_copilot.rb` and the `source/apps/mobi-copilot-sketchup/mobi_copilot/` folder into the SketchUp 2026 Plugins directory.
3. Start SketchUp 2026.
4. Confirm the panel opens automatically.
5. If needed, open `Extensions -> Mobi Copilot -> Abrir Painel`.
6. Confirm the Project, Statistics, Selection, and Recent Events cards are visible.
7. Select an entity and confirm Selection updates.
8. Save the project and confirm Recent Events records the save.
9. Click each large navigation button and confirm the panel remains responsive.
10. Confirm no AI/chat/server/external integration behavior appears.

## Expected Result

The designer sees a clean, modern, responsive dashboard that provides useful project context and navigation without exposing debug logs.

## Files

- `mobi_copilot.rb`
- `mobi_copilot/main.rb`
- `mobi_copilot/panel.rb`
- `mobi_copilot/runtime_state.rb`
- `mobi_copilot/observers.rb`
- `mobi_copilot/ui/dashboard.html`

## Scope Guard

CP001 is foundation plus dashboard only. It does not implement AI, chat, automation, servers, component mutation, Dinabox integration, or automatic suggestions.

