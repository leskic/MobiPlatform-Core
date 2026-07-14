# frozen_string_literal: true

require "sketchup.rb"
require "time"

module Mobi
  module Copilot
    module RuntimeState
      MAX_EVENTS = 12
      @started_at = Time.now
      @events = []

      module_function

      def snapshot
        model = Sketchup.active_model
        {
          project: project(model),
          statistics: statistics(model),
          selection: selection(model),
          events: events,
          session: { startedAt: @started_at.iso8601, durationSeconds: (Time.now - @started_at).to_i }
        }
      end

      def record_event(type, message)
        @events.unshift({ time: Time.now.strftime("%H:%M:%S"), type: type, message: message })
        @events = @events.first(MAX_EVENTS)
      end

      def project(model)
        path = model.path.to_s
        {
          name: model.title.to_s.empty? ? "Sem titulo" : model.title,
          path: path.empty? ? "Arquivo ainda nao salvo" : path,
          lastSavedAt: model.modified? ? "Alteracoes pendentes" : "Sem alteracoes pendentes"
        }
      end

      def statistics(model)
        entities = model.entities
        {
          components: entities.grep(Sketchup::ComponentInstance).length,
          groups: entities.grep(Sketchup::Group).length,
          entities: entities.length,
          materials: model.materials.length
        }
      end

      def selection(model)
        entity = model.selection.first
        return empty_selection unless entity

        {
          name: entity.respond_to?(:name) && !entity.name.to_s.empty? ? entity.name : entity.typename,
          type: entity.typename,
          layer: entity.respond_to?(:layer) && entity.layer ? entity.layer.name : "Sem tag",
          material: entity.respond_to?(:material) && entity.material ? entity.material.display_name : "Sem material",
          dimensions: dimensions(entity)
        }
      end

      def empty_selection
        { name: "Nada selecionado", type: "-", layer: "-", material: "-", dimensions: "-" }
      end

      def dimensions(entity)
        return "-" unless entity.respond_to?(:bounds)

        bounds = entity.bounds
        "#{bounds.width.to_mm.round} x #{bounds.height.to_mm.round} x #{bounds.depth.to_mm.round} mm"
      end

      def events
        @events.empty? ? [{ time: Time.now.strftime("%H:%M:%S"), type: "Projeto aberto", message: "Painel iniciado" }] : @events
      end
    end
  end
end
