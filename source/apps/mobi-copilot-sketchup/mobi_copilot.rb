# frozen_string_literal: true

require "sketchup.rb"
require "extensions.rb"

module Mobi
  module Copilot
    EXTENSION_NAME = "Mobi Copilot"
    EXTENSION_VERSION = "0.1.0-cp001"

    loader = File.join(__dir__, "mobi_copilot", "main")
    extension = SketchupExtension.new(EXTENSION_NAME, loader)
    extension.description = "Assistente tecnico do projetista dentro do SketchUp."
    extension.version = EXTENSION_VERSION
    extension.creator = "Mobi Platform"
    extension.copyright = "Mobi Platform"

    Sketchup.register_extension(extension, true)
  end
end

