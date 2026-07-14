# frozen_string_literal: true

require "sketchup.rb"
require_relative "panel"
require_relative "observers"

module Mobi
  module Copilot
    module Main
      module_function

      def install
        Observers.install
        create_menu
        Panel.show
      end

      def create_menu
        menu = UI.menu("Extensions").add_submenu("Mobi Copilot")
        menu.add_item("Abrir Painel") { Panel.show }
        menu.add_item("Atualizar Painel") { Panel.refresh }
      end
    end
  end
end

unless file_loaded?(__FILE__)
  Mobi::Copilot::Main.install
  file_loaded(__FILE__)
end

