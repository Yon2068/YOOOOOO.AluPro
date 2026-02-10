require "sketchup.rb"
require "extensions.rb"

module YOOOOOO
  module AluPro
    EXT_VERSION = "1.2.0"
    EXT_TITLE = "YOOOOOO AluPro"
    EXT_NAME = "YOOOOOO.AluPro"
    EXT_DESCRIPTION = "YOOOOOO aluminum profiles designer."

    ext_dir = File.dirname(__FILE__).gsub(%r{//}) { "/" }
    ext_dir.force_encoding("UTF-8") if ext_dir.respond_to?(:force_encoding)
    loader = File.join(EXT_NAME, "main")

    extension = SketchupExtension.new(EXT_TITLE, loader)
    extension.description = EXT_DESCRIPTION
    extension.version = EXT_VERSION
    extension.creator = "YOOOOOO"
    extension.copyright = "Trimble Inc © 2016-2022"

    Sketchup.register_extension(extension, true)
  end
end
