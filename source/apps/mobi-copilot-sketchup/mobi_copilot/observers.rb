# frozen_string_literal: true

require "sketchup.rb"
require_relative "runtime_state"

module Mobi
  module Copilot
    class AppObserver < Sketchup::AppObserver
      def onNewModel(_model)
        RuntimeState.record_event("Projeto aberto", "Novo projeto")
        Panel.refresh if defined?(Panel)
      end

      def onOpenModel(model)
        RuntimeState.record_event("Projeto aberto", model.title.to_s.empty? ? "Arquivo aberto" : model.title)
        Panel.refresh if defined?(Panel)
      end
    end

    class ModelObserver < Sketchup::ModelObserver
      def onSaveModel(model)
        RuntimeState.record_event("Projeto salvo", model.title.to_s.empty? ? "Arquivo salvo" : model.title)
        Panel.refresh if defined?(Panel)
      end

      def onTransactionCommit(_model)
        RuntimeState.record_event("Alteracao", "Modelo atualizado")
        Panel.refresh if defined?(Panel)
      end
    end

    class SelectionObserver < Sketchup::SelectionObserver
      def onSelectionBulkChange(_selection)
        RuntimeState.record_event("Selecao alterada", "Selecao atualizada")
        Panel.refresh if defined?(Panel)
      end

      def onSelectionCleared(_selection)
        RuntimeState.record_event("Selecao alterada", "Selecao limpa")
        Panel.refresh if defined?(Panel)
      end
    end

    module Observers
      module_function

      def install
        return if @installed

        Sketchup.add_observer(AppObserver.new)
        model = Sketchup.active_model
        model.add_observer(ModelObserver.new)
        model.selection.add_observer(SelectionObserver.new)
        RuntimeState.record_event("Projeto aberto", model.title.to_s.empty? ? "Projeto atual" : model.title)
        @installed = true
      end
    end
  end
end

