require_relative "../utils/dimensions"
require_relative "../ui/dialog_handler"

module YOOOOOO
  module AluPro
    module Observers
      class ComponentSelectionObserver < Sketchup::SelectionObserver
        # 可选：添加回调支持
        # attr_accessor :on_two_components_selected

        def initialize
          # @on_two_components_selected = nil
          # @last_components = []
          puts "[ComponentSelectionObserver] 已创建观察者实例。"
        end

        # 选择批量变化时触发
        def onSelectionBulkChange(selection)
          puts "批量选择变化: #{selection.size} 个组件已选择。"
          # 获取所有选中的组件实例（包括组）
          components = selection.select do |entity|
            entity.is_a?(Sketchup::ComponentInstance) || entity.is_a?(Sketchup::Group)
          end
          dialog = UI::DialogHandler.current_dialog
          attr = "''"
          if dialog && selection.size == 1
            measure = Utils::Dimensions.measure_component_exact(components.first, true)
            # 调用JavaScript函数更新UI
            if measure && measure[:height_z]
              attr = "'材料长度: #{measure[:height_z].mm}'"
            end
          end

          if dialog
            js_code = "updateStatus(#{attr})"
            dialog.execute_script(js_code)
          else
            puts "WebDialog未设置"
          end

          # 计算模型中相同组件定义的实例总数
          instance_count = 0
          selected_component = components.first
          if selected_component
            definition_name = selected_component.definition.name
            model = Sketchup.active_model
            if model
              # 统计所有具有相同定义的组件实例
              instance_count = model.entities.grep(Sketchup::ComponentInstance).count { |instance|
                instance.definition.name == definition_name
              }
            end
          end
          puts "模型中相同组件定义的实例总数: #{instance_count}"
        end

        # 选择添加时触发
        def onSelectionAdded(selection, entity)
        end

        # 选择移除时触发
        def onSelectionRemoved(selection, entity)
        end

        # 选择清空时触发
        def onSelectionCleared(selection)
        end
      end
    end
  end
end
