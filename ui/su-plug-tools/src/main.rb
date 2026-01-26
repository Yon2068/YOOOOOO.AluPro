require "sketchup.rb"
require "extensions.rb"

# 加载观察者文件
require_relative "observers/component_selection_observer"

# # 动态加载工具
# Dir[File.join(__dir__, "tools", "**", "*.rb")].each do |tool_file|
#   require_relative tool_file
# end

module YOOOOOO
  module AluPro
    PROJECT_ROOT = File.dirname(__FILE__).gsub(%r{//}) { "/" }.freeze

    def self.setup_extensions
      ex = SketchupExtension.new("YOOOOOO AluPro", "ui/dialog_handler")
      ex.description = "YOOOOOO aluminum profiles designer."
      ex.version = "1.0.0"
      ex.copyright = "Trimble Inc © 2016-2022"
      ex.creator = "YOOOOOO"
      Sketchup.register_extension(ex, true)
    end

    def self.setup_observers
      Sketchup.active_model.selection.add_observer(Observers::ComponentSelectionObserver.new)
    end

    unless file_loaded?(__FILE__)
      setup_extensions
      setup_observers
      file_loaded(__FILE__)
    end
  end
end
