module YOOOOOO
  module AluPro
    module Core
      class SnapToFaceTool
        # 构造函数
        def initialize(is_copy = false)
          @is_copy = is_copy
          @selected_components = []  # 从选择集中获取的组件列表
          @reference_face = nil    # 基准面
          @reference_transformation = nil
          @hover_face = nil        # 当前悬停的面
          @hover_transformation = nil
          @last_update_time = Time.now
          @model = Sketchup.active_model
          @view = @model.active_view

          # 验证选择
          @selected_components = get_selected_components
          if @selected_components.empty?
            puts "请先选择要吸附的组件，然后再启动此工具"
            @model.select_tool(nil)
            return
          end
          # 开启事务
          @model.start_operation("吸附组件到面")

          # 复制模式
          if @is_copy
            # 用于存储实际要移动的组件
            new_components = []
            # 如果is_copy为true，复制选中的组件
            @selected_components.each do |component|
              # 复制组件
              new_component = @model.entities.add_instance(component.definition, component.transformation)
              new_components << new_component
            end
            @selected_components = new_components
          end

          puts "吸附工具已激活。已选择 #{@selected_components.length} 个组件。步骤1: 请选择基准面"
        end

        # 工具激活时调用
        def activate
          update_status_text
          @view.invalidate
        end

        # 当工具因选择了不同工具而停用时，该方法被调用。#deactivate
        def deactivate(view)
          clear_highlights(view)
          # @model.commit_operation
          view.invalidate
          puts "已结束吸附组件到面"
        end

        # 鼠标移动时调用
        def onMouseMove(flags, x, y, view)
          current_time = Time.now
          return if current_time - @last_update_time < 0.02
          @last_update_time = current_time

          # 拾取当前鼠标下的面
          ph = view.pick_helper
          ph.do_pick(x, y)

          old_face = @hover_face
          @hover_face = ph.picked_face
          @hover_transformation = ph.transformation_at(0) if @hover_face

          update_status_text
          view.invalidate if old_face != @hover_face
        end

        # 鼠标左键按下时调用
        def onLButtonDown(flags, x, y, view)
          return false unless @hover_face

          @reference_face = @hover_face
          @reference_transformation = @hover_transformation

          # 验证所有选中的组件是否都有与基准面平行的面
          if Utils::Draw.validate_components_alignment(@reference_face, @reference_transformation, @selected_components)
            snap_components_to_face
          else
            ::UI.messagebox("错误: 选中的组件中存在与基准面不平行的面，请重新选择")
          end

          view.invalidate
          true
        end

        # 鼠标右键按下时调用
        def onRButtonDown(flags, x, y, view)
          # 右键退出工具
          @model.select_tool(nil)
          true
        end

        # 键盘按下时调用
        def onKeyDown(key, repeat, flags, view)
          if key == 27 # ESC键
            @model.abort_operation
            @model.select_tool(nil)
            return true
          end
          false
        end

        # 每当视图刷新以允许工具自行绘制时，SketchUp 都会调用。
        def draw(view)
          if @hover_face
            color = [255, 165, 0]  # 橙色
            Utils::Draw.draw_face_highlight(view, @hover_face, @hover_transformation, color)
          end
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

        # def validate_components_alignment
        #   ref_normal = get_face_normal(@reference_face, @reference_transformation)

        #   # 遍历所有选中的组件
        #   @selected_components.each do |component|
        #     # 获取组件实例中的面
        #     component_faces = component.entities.grep(Sketchup::Face)
        #     has_parallel_face = false
        #     # 遍历组件中的面
        #     component_faces.each do |face|
        #       component_normal = get_face_normal(face, component.transformation)
        #       # dot_product = ref_normal.dot(component_normal)
        #       # 检查是否平行
        #       if ref_normal.parallel?(component_normal)
        #         has_parallel_face = true
        #         break
        #       end
        #     end

        #     unless has_parallel_face
        #       return false
        #     end
        #   end

        #   true
        # end

        # 吸附组件到面
        def snap_components_to_face
          begin
            # 获取基准面在世界坐标系下的 法线
            ref_normal = Utils::Draw.get_face_normal(@reference_face, @reference_transformation)
            # 获取基准面在世界坐标系下的 中心点
            ref_center = Utils::Draw.get_face_center(@reference_face, @reference_transformation)

            # 遍历所有选中的组件
            @selected_components.each do |component|
              # 找到组件上与基准面平行的面
              parallel_face = find_parallel_face(component, ref_normal)
              next unless parallel_face

              # 计算组件上平行面的中心点
              component_face_center = Utils::Draw.get_face_center(parallel_face, component.transformation)

              # 计算从基准面中心到组件面中心的向量
              vector_to_component = ref_center.vector_to(component_face_center)

              # 计算这个向量在基准面法线方向上的投影距离
              distance_along_normal = vector_to_component.dot(ref_normal)

              # 计算移动向量：移动组件使其面上的点与基准面重合
              # 这样组件上平行于基准面的面就会贴合到基准面上
              move_vector = Geom::Vector3d.new(
                ref_normal.x * -distance_along_normal,
                ref_normal.y * -distance_along_normal,
                ref_normal.z * -distance_along_normal
              )

              # 应用变换
              current_transform = component.transformation
              translation = Geom::Transformation.translation(move_vector)
              new_transform = translation * current_transform

              component.transformation = new_transform
            end

            puts "成功吸附 #{@selected_components.length} 个组件到基准面"
          rescue => e
            @model.abort_operation
            puts "吸附组件时出错: #{e.message}"
            ::UI.messagebox("吸附失败: #{e.message}")
          end
        end

        # 在组件中寻找与基准面平行的面
        def find_parallel_face(component, target_normal)
          component_faces = component.entities.grep(Sketchup::Face)

          # 寻找最靠近基准面的平行面
          closest_face = nil
          closest_distance = Float::INFINITY

          component_faces.each do |face|
            component_normal = Utils::Draw.get_face_normal(face, component.transformation)
            # dot_product = target_normal.dot(component_normal)
            target_normal.parallel?(component_normal)

            # 检查是否平行（同向或反向）
            if target_normal.parallel?(component_normal)
              # 计算面中心到基准面的距离
              face_center = Utils::Draw.get_face_center(face, component.transformation)
              ref_center = Utils::Draw.get_face_center(@reference_face, @reference_transformation)
              distance = (face_center.vector_to(ref_center)).dot(target_normal).abs

              if distance < closest_distance
                closest_distance = distance
                closest_face = face
              end
            end
          end

          closest_face
        end

        # def get_face_normal(face, transformation)
        #   normal = face.normal
        #   transformation ? normal.transform(transformation) : normal
        # end

        # def get_face_center(face, transformation)
        #   bounds = face.bounds
        #   center = bounds.center
        #   transformation ? center.transform(transformation) : center
        # end

        def clear_highlights(view)
          @hover_face = nil
          view.invalidate
        end

        def update_status_text
          if @hover_face
            Sketchup.status_text = "步骤1: 选择基准面 | 已选择 #{@selected_components.length} 个组件 | 左键选择基准面 | ESC退出"
          else
            Sketchup.status_text = "步骤1: 选择基准面 | 已选择 #{@selected_components.length} 个组件 | 移动鼠标选择面 | ESC退出"
          end
        end

        # def draw_component_highlight(view, component)
        #   # 绘制组件的边界框
        #   bounds = component.bounds
        #   points = [
        #     Geom::Point3d.new(bounds.min.x, bounds.min.y, bounds.min.z),
        #     Geom::Point3d.new(bounds.max.x, bounds.min.y, bounds.min.z),
        #     Geom::Point3d.new(bounds.max.x, bounds.max.y, bounds.min.z),
        #     Geom::Point3d.new(bounds.min.x, bounds.max.y, bounds.min.z),
        #     Geom::Point3d.new(bounds.min.x, bounds.min.y, bounds.max.z),
        #     Geom::Point3d.new(bounds.max.x, bounds.min.y, bounds.max.z),
        #     Geom::Point3d.new(bounds.max.x, bounds.max.y, bounds.max.z),
        #     Geom::Point3d.new(bounds.min.x, bounds.max.y, bounds.max.z),
        #   ]

        #   # 绘制立方体框架
        #   view.line_width = 2
        #   view.drawing_color = Sketchup::Color.new(0, 255, 0)  # 绿色

        #   # 底面
        #   view.draw(GL_LINE_LOOP, [points[0], points[1], points[2], points[3]])
        #   # 顶面
        #   view.draw(GL_LINE_LOOP, [points[4], points[5], points[6], points[7]])
        #   # 连接线
        #   4.times { |i| view.draw(GL_LINES, [points[i], points[i + 4]]) }
        # end

        # def draw_face_highlight(view, face, transformation, color_rgb)
        #   begin
        #     # 绘制边框
        #     view.line_width = 3
        #     view.drawing_color = Sketchup::Color.new(color_rgb[0], color_rgb[1], color_rgb[2])

        #     points = []
        #     face.outer_loop.vertices.each do |vertex|
        #       point = vertex.position
        #       point = point.transform(transformation) if transformation
        #       points << point
        #     end

        #     # 闭合边框
        #     view.draw(GL_LINE_LOOP, points)

        #     # 半透明填充
        #     mesh = face.mesh
        #     triangles = []

        #     mesh.polygons.each do |polygon|
        #       indices = polygon.map(&:abs)

        #       if indices.length == 3
        #         indices.each do |idx|
        #           point = mesh.point_at(idx)
        #           point = point.transform(transformation) if transformation
        #           triangles << point
        #         end
        #       elsif indices.length == 4
        #         # 四边形转换为两个三角形
        #         [0, 1, 2, 0, 2, 3].each do |i|
        #           idx = i < 3 ? indices[i] : indices[i - 3]
        #           point = mesh.point_at(idx)
        #           point = point.transform(transformation) if transformation
        #           triangles << point
        #         end
        #       end
        #     end

        #     # 设置半透明颜色
        #     alpha = 80
        #     view.drawing_color = [color_rgb[0], color_rgb[1], color_rgb[2], alpha]
        #     view.draw(GL_TRIANGLES, triangles) if triangles.any?
        #   rescue => e
        #     # 静默处理绘制错误
        #   end
        # end
      end

      # 主函数：启动吸附工具
      def self.snap_to_face_tool(is_copy = false)
        puts "吸附到面工具 v1.0"
        puts "请先选择要吸附的组件，然后启动此工具"
        puts "=" * 50

        tool = SnapToFaceTool.new(is_copy)
        # 只有在有选中组件时才激活工具
        if tool.instance_variable_get(:@selected_components).any?
          Sketchup.active_model.select_tool(tool)
          Sketchup::focus()
        end
      end
    end
  end
end
