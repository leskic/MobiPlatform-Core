# frozen_string_literal: true

require "json"
require "sketchup.rb"
require_relative "runtime_state"

module Mobi
  module Copilot
    module Panel
      WIDTH = 390
      HEIGHT = 760

      module_function

      def show
        dialog.show
        refresh
      end

      def refresh
        return unless @dialog

        dialog.execute_script("window.MobiCopilot && window.MobiCopilot.update(#{RuntimeState.snapshot.to_json})")
      end

      def dialog
        @dialog ||= begin
          html = File.read(File.join(__dir__, "ui", "dashboard.html"))
          instance = UI::HtmlDialog.new(
            dialog_title: "Mobi Copilot",
            preferences_key: "mobi_copilot.dashboard",
            scrollable: true,
            resizable: true,
            width: WIDTH,
            height: HEIGHT,
            style: UI::HtmlDialog::STYLE_DIALOG
          )
          instance.set_html(html)
          bind_callbacks(instance)
          instance
        end
      end

      def bind_callbacks(instance)
        instance.add_action_callback("mobiCopilotNavigate") do |_context, section|
          RuntimeState.record_event("Navegacao", "Painel #{section}")
          refresh
        end
        instance.add_action_callback("mobiCopilotSnapshot") do |_context|
          RuntimeState.record_event("Snapshot", "Snapshot solicitado")
          refresh
        end
      end
    end
  end
end

