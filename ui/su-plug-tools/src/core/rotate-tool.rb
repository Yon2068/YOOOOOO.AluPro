require_relative "../utils/rotate"
require_relative "../utils/draw"

module YOOOOOO
  module AluPro
    module Core
      class RotateTool
        # 构造函数
        def initialize(direction)
          puts "=" * 50
          @selected_components = []  # 从选择集中获取的组件列表
          @model = Sketchup.active_model
          @view = @model.active_view

          # 验证方向
          if direction.nil?
            puts "请指定旋转方向"
            @model.select_tool(nil)
            return
          end

          if direction != "front" && direction != "side" && direction != "top"
            puts "未知的旋转方向: #{direction}"
            @model.select_tool(nil)
            return
          end

          # 验证选择
          @selected_components = get_selected_components
          if @selected_components.empty?
            puts "请先选择要旋转的组件，然后再启动此工具"
            @model.select_tool(nil)
            return
          end

          case direction
          when "front"
            Utils::Rotate.rotate_front_face(@selected_components.first, @model)
          when "side"
            Utils::Rotate.rotate_side_face(@selected_components.first, @model)
          when "top"
            Utils::Rotate.rotate_top_face(@selected_components.first, @model)
          else
            puts "未知的旋转方向: #{direction}"
          end
          # 开启事务
          @model.start_operation("旋转组件")

          puts "旋转工具 v1.0"
          puts "请先选择要旋转的组件，然后启动此工具"
          Sketchup.active_model.select_tool(self)
          Sketchup::focus()
        end

        # 工具激活时调用
        def activate
          update_status_text
          @view.invalidate
        end

        # 工具被取消时调用
        def deactivate(view)
          clear_highlights(view)
          @model.commit_operation
          view.invalidate
        end

        # 鼠标右键按下时调用
        def onRButtonDown(flags, x, y, view)
          # 右键退出工具
          @model.select_tool(nil)
          true
        end

        # 每当视图刷新以允许工具自行绘制时，SketchUp 都会调用。
        def draw(view)
          # 高亮显示选中的组件
          @selected_components.each do |component|
            Utils::Draw.draw_component_face_highlight(view, component)
          end
        end

        # 设置光标
        def onSetCursor
          ::UI.set_cursor(631)  # 拾取光标
        end

        private

        def get_selected_components
          selected_entities = @model.selection.to_a
          components = []

          selected_entities.each do |entity|
            if entity.is_a?(Sketchup::ComponentInstance) || entity.is_a?(Sketchup::Group)
              components << entity
            end
          end

          components
        end

        def clear_highlights(view)
          @hover_face = nil
          view.invalidate
        end

        def update_status_text
          # if @hover_face
          #   Sketchup.status_text = "步骤1: 选择基准面 | 已选择 #{@selected_components.length} 个组件 | 左键选择基准面 | ESC退出"
          # else
          #   Sketchup.status_text = "步骤1: 选择基准面 | 已选择 #{@selected_components.length} 个组件 | 移动鼠标选择面 | ESC退出"
          # end
        end
      end
    end
  end
end
