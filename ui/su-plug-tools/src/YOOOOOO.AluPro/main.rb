require "sketchup.rb"
# 加载观察者文件
require_relative "observers/component_selection_observer"
require_relative "updater"

# # 动态加载工具
# Dir[File.join(__dir__, "tools", "**", "*.rb")].each do |tool_file|
#   require_relative tool_file
# end

module YOOOOOO
  module AluPro
    PROJECT_ROOT = File.dirname(__FILE__).gsub(%r{//}) { "/" }.freeze
    VERSION = "1.0.0"

    def self.extension_version
      return EXT_VERSION if defined?(EXT_VERSION)

      entry_file = File.expand_path("../YOOOOOO.AluPro.rb", PROJECT_ROOT)
      if File.exist?(entry_file)
        content = File.read(entry_file)
        match = content.match(/EXT_VERSION\s*=\s*"([^"]+)"/)
        return match[1] if match
      end

      VERSION
    end

    def self.setup_observers
      @selection_observer = Observers::ComponentSelectionObserver.new
      Sketchup.active_model.selection.add_observer(@selection_observer)
    end

    def self.teardown_observers
      if @selection_observer && Sketchup.active_model
        Sketchup.active_model.selection.remove_observer(@selection_observer)
        @selection_observer = nil
      end
    end

    unless file_loaded?(__FILE__)
      setup_observers
      file_loaded(__FILE__)
    end
  end
end
