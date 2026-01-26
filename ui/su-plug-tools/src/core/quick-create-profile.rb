module YOOOOOO
  module AluPro
    module Core
      class QuickCreateProfileTool
        def initialize(size)
          @step = 1  # 步骤1：选择起点面
          @selected_component = nil   # 选择的组件实例
          @reference_face = nil  # 起点面
          @target_face = nil     # 终点面
          @reference_transformation = nil
          @target_transformation = nil
          @hover_face = nil      # 当前悬停的面
          @hover_transformation = nil
          @hover_instance = nil  # pick_helper 可能给出的实例
          @last_update_time = Time.now
          @model = Sketchup.active_model
          @view = @model.active_view
          @size = size # 型材规格

          # 新增：型材实例和移动相关变量
          @profile_instance = nil
          @profile_length = nil
          @profile_direction = nil
          @profile_plane_normal = nil # 用于移动的平面法线

          puts "快速创建工具已激活。步骤#{@step}: 请选择一个面作为起点"
          puts "型材规格: #{@size}"
        end

        # 当选中工具时，SketchUp 会调用 #activate 方法。
        def activate
          update_status_text
          @view.invalidate
        end

        # 当工具因选择了不同的工具而停用时，调用了 #deactivate 方法。
        def deactivate(view)
          clear_highlights(view)
          view.invalidate
        end

        # 每当鼠标移动时，SketchUp都会调用 #onMouseMove 方法。
        def onMouseMove(flags, x, y, view)
          current_time = Time.now
          return if current_time - @last_update_time < 0.02
          @last_update_time = current_time

          # 拾取当前鼠标下的面
          ph = view.pick_helper
          ph.do_pick(x, y)

          old_face = @hover_face
          @hover_face = ph.picked_face
          # 尝试获取 picked_instance（更可靠）
          @hover_instance = ph.respond_to?(:picked_instance) ? ph.picked_instance : nil
          @hover_transformation = ph.transformation_at(0) if @hover_face

          update_status_text
          view.invalidate if old_face != @hover_face # 视图标记为需要重绘
        end

        # 当按下左键时，SketchUp 会调用 #onLButtonDown 方法。大多数工具都能实现这种方法。
        def onLButtonDown(flags, x, y, view)
          return false unless @hover_face # 仅绘制面

          case @step
          when 1
            select_start_face # 选择起始面
          when 2
            select_end_face # 选择终点面
          end

          view.invalidate # 刷新视图
          true
        end

        # 当用户按下右键时，SketchUp 调用了 #onRButtonDown 方法。当你希望工具在点击右键时显示默认的上下文菜单，可以实现这个方法和 tool.getMenu 方法一起。
        def onRButtonDown(flags, x, y, view)
          # 右键取消当前选择或退出工具
          if @step == 2 && @selected_component
            reset_to_step1
          else
            view.model.select_tool(nil)
          end
          true
        end

        def onKeyDown(key, repeat, flags, view)
          # 使用Sketchup的键盘常量
          if key == 27 # ESC键的键码
            view.model.select_tool(nil)
            return true
          end

          # 处理方向键移动
          if @step == 3 # 新增步骤，表示型材已创建，可以移动
            case key
            when 38 # 上箭头键的键码
              move_profile(0, 1)  # 向上移动
            when 40 # 下箭头键的键码
              move_profile(0, -1) # 向下移动
            when 37 # 左箭头键的键码
              move_profile(-1, 0) # 向左移动
            when 39 # 右箭头键的键码
              move_profile(1, 0)  # 向右移动
            end
            view.invalidate
            return true
          end

          false
        end

        # 每当视图刷新以允许工具自行绘制时，SketchUp 都会调用 #draw 方法。如果工具有需要在激活时显示的临时图形，它应该实现这个方法并绘制到视图。
        def draw(view)
          draw_hover_highlight(view)
          draw_selected_highlights(view)
          draw_profile_highlights(view) if @step == 3
        end

        # 当工具想设置光标时，SketchUp会调用 #onSetCursor 方法。
        def onSetCursor
          ::UI.set_cursor(631)  # 拾取光标
        end

        private

        def select_start_face
          # 优先使用 pick_helper 给出的实例，如果没有再查找
          component = @hover_instance || find_component_from_face(@hover_face, @hover_transformation)

          if component
            @selected_component = component
            @reference_face = @hover_face
            @reference_transformation = @hover_transformation
            @step = 2
            @hover_face = nil
            @hover_instance = nil

            component_name = get_component_name(component)
            puts "已选择起点面: #{component_name}"
            puts "步骤#{@step}: 请选择终点面"
          else
            puts "请选择属于组件或组的面"
          end
        end

        def select_end_face
          @target_face = @hover_face
          @target_transformation = @hover_transformation

          # 检查两个面是否平行
          if faces_parallel?
            place_profile_between_faces
            @model.select_tool(nil) # 创建完成后退出工具
          else
            UI.messagebox("错误: 选择的两个面不平行，请重新选择")
            reset_to_step1
          end
        end

        def faces_parallel?
          # 获取全局法线（确保你的 Utils::Draw.get_face_normal 里用了 .normalize）
          ref_normal = Utils::Draw.get_face_normal(@reference_face, @reference_transformation)
          target_normal = Utils::Draw.get_face_normal(@target_face, @target_transformation)

          # 直接使用 API 内置的平行判断
          is_parallel = ref_normal.parallel?(target_normal)

          # 调试输出
          puts "参考面法线: #{format_vector(ref_normal)}"
          puts "目标面法线: #{format_vector(target_normal)}"
          puts "是否平行: #{is_parallel}"

          is_parallel
        end

        # 放置铝型材在两个面之间
        def place_profile_between_faces
          begin
            @model.start_operation("快速创建型材")

            # 计算两个面之间的距离
            distance, direction = calculate_distance_and_direction
            puts "距离: #{distance.to_l} 方向: #{direction}"  # --- IGNORE ---

            # 加载型材组件定义
            comp_def = load_profile_definition(@size)
            return unless comp_def

            # 计算放置点和旋转
            placement_point, rotation_angles = calculate_placement_and_rotation(direction)

            # 创建并放置型材实例
            @profile_instance = place_profile_instance(comp_def, placement_point, rotation_angles, distance)

            # 保存型材信息用于后续移动
            @profile_length = distance
            @profile_direction = direction

            # 计算移动平面的法线（垂直于型材方向）
            ref_normal = Utils::Draw.get_face_normal(@reference_face, @reference_transformation)
            @profile_plane_normal = ref_normal

            @model.commit_operation
            puts "型材创建成功！长度: #{distance.to_l}"
            puts direction > 0 ? "型材方向: 朝向目标面" : "型材方向: 远离目标面"

            # 进入步骤3，允许移动
            @step = 3
            update_status_text
          rescue => e
            @model.abort_operation
            puts "创建型材时出错: #{e.message}"
            UI.messagebox("创建失败: #{e.message}")
          end
        end

        def calculate_distance_and_direction
          # 1. 获取全局法线和中心点
          ref_normal = Utils::Draw.get_face_normal(@reference_face, @reference_transformation)
          ref_point = get_face_center(@reference_face, @reference_transformation)

          target_point = get_face_center(@target_face, @target_transformation)

          # 2. 计算位移向量
          vector_to_target = target_point - ref_point

          # 3. 计算投影值 (dot 结果是一个长度数值)
          # dot > 0 表示目标面在参考面法线同侧
          # dot < 0 表示目标面在参考面法线反侧
          projection = vector_to_target.dot(ref_normal)

          # 4. 使用 SketchUp 容差处理 (可选)
          # 如果点积结果极小（比如 1e-12），将其归零，防止细微震荡
          projection = 0.0 if projection.abs < 0.001.mm

          # 5. 返回结果
          # distance 使用 abs 确保为正，direction 保留正负号用于判断前后方位
          distance = projection.abs

          [distance, projection]
        end

        def calculate_placement_and_rotation(direction)
          # 获取参考面的中心点
          placement_point = get_face_center(@reference_face, @reference_transformation)

          # 获取参考面的法向量（全局坐标系）
          ref_normal = Utils::Draw.get_face_normal(@reference_face, @reference_transformation)

          # 计算旋转角度 - 使型材的Z轴与参考面法线对齐
          rotation_angles = calculate_rotation_angles(ref_normal, direction)

          # 将放置点调整到参考面的表面上
          # 型材的端面应该刚好贴在参考面上
          placement_point = adjust_placement_point(placement_point, ref_normal)

          [placement_point, rotation_angles]
        end

        def calculate_rotation_angles(normal, direction)
          # 默认导入的型材沿蓝轴(Z轴)拉伸
          # 需要旋转使得型材的Z轴与参考面的法线对齐

          normal.normalize!

          x_angle = 0
          y_angle = 0
          z_angle = 0

          # 检查法线与各轴的关系
          if normal.parallel?(Z_AXIS)
            # 法线与Z轴平行
            if normal.dot(Z_AXIS) > 0
              # 与Z轴同向
              x_angle = 0.degrees
            else
              # 与Z轴反向
              x_angle = 180.degrees
            end
          elsif normal.parallel?(X_AXIS)
            # 法线与X轴平行
            y_angle = normal.dot(X_AXIS) > 0 ? 90.degrees : -90.degrees
          elsif normal.parallel?(Y_AXIS)
            # 法线与Y轴平行
            x_angle = normal.dot(Y_AXIS) > 0 ? -90.degrees : 90.degrees
          else
            # 通用情况：使用向量旋转
            # 计算绕Z轴的旋转
            xy_projection = Geom::Vector3d.new(normal.x, normal.y, 0)
            if xy_projection.length > 0
              xy_projection.normalize!
              z_angle = Math.atan2(xy_projection.y, xy_projection.x)
            end

            # 计算绕Y轴的旋转
            xz_projection = Geom::Vector3d.new(normal.x, 0, normal.z)
            if xz_projection.length > 0
              xz_projection.normalize!
              y_angle = Math.asin(xz_projection.x)
            end
          end

          # 如果方向为负（两个面法线同向），需要旋转180度
          if direction < 0
            x_angle += 180.degrees
          end

          { x: x_angle, y: y_angle, z: z_angle }
        end

        def adjust_placement_point(point, normal)
          # 将放置点调整到参考面的表面上
          # 这里我们假设型材的端面在局部坐标系的原点
          # 所以不需要额外的偏移
          point
        end

        def place_profile_instance(comp_def, position, rotation_angles, length)
          # 创建唯一的组件定义名称
          timestamp = Time.now.to_f.to_s.gsub(".", "")
          unique_name = "#{comp_def.name}_#{timestamp}"

          # 创建新的组件定义
          new_def = @model.definitions.add(unique_name)

          # 复制原始定义的几何体
          temp_instance = new_def.entities.add_instance(comp_def, Geom::Transformation.new)
          temp_instance.explode

          # 创建变换矩阵（包含旋转和位置）
          transform = create_transform_matrix(position, rotation_angles)

          # 创建最终实例
          final_instance = @model.active_entities.add_instance(new_def, transform)

          # 使用更精确的推拉方法
          pull_profile_with_direction(final_instance, length)

          # 处理柔滑边线，显示所有边线
          Utils::Draw.soften_edges_by_angle_for_instance(final_instance)
          final_instance
        end

        def create_transform_matrix(position, rotation_angles)
          # 创建绕三个轴的旋转
          x_rotation = Geom::Transformation.rotation([0, 0, 0], [1, 0, 0], rotation_angles[:x])
          y_rotation = Geom::Transformation.rotation([0, 0, 0], [0, 1, 0], rotation_angles[:y])
          z_rotation = Geom::Transformation.rotation([0, 0, 0], [0, 0, 1], rotation_angles[:z])

          # 组合旋转
          rotation = x_rotation
          rotation = y_rotation * rotation
          rotation = z_rotation * rotation

          # 添加平移
          Geom::Transformation.new(position) * rotation
        end

        def pull_profile_with_direction(instance, length)
          # 获取实例的变换矩阵，用于将局部坐标转换为世界坐标
          instance_transform = instance.transformation

          comp_ents = instance.definition.entities
          faces = comp_ents.grep(Sketchup::Face)

          # 找到型材的两个端面
          end_faces = find_profile_end_faces(faces)

          if end_faces.length >= 2
            # 获取两个面在世界坐标系中的位置
            ref_center_world = end_faces[0].bounds.center.transform(instance_transform)
            target_center_world = end_faces[1].bounds.center.transform(instance_transform)

            # 计算当前两个端面之间的距离
            current_distance = ref_center_world.distance(target_center_world)

            # 确定哪个面应该移动
            # 根据目标长度决定推拉哪个面
            if length > current_distance
              # 需要增长，选择距离参考面较远的面进行推拉
              reference_point = get_face_center(@reference_face, @reference_transformation)
              face1_dist = reference_point.distance(end_faces[0].bounds.center.transform(instance_transform))
              face2_dist = reference_point.distance(end_faces[1].bounds.center.transform(instance_transform))

              face_to_pull = face1_dist < face2_dist ? end_faces[1] : end_faces[0]  # 移动距离参考面较远的面
              pull_distance = length - current_distance
              face_to_pull.pushpull(pull_distance)
            else
              # 需要缩短，可能需要重新设计几何体
              puts "目标长度小于当前长度，可能需要重新设计几何体"
            end
          else
            # 如果只找到一个端面，按原方法推拉
            pull_profile_length(instance, length)
          end
        end

        def find_profile_end_faces(faces)
          end_faces = []
          faces.each do |face|
            normal = face.normal
            # 检查是否垂直于Z轴（型材的拉伸方向）
            if normal.parallel?(Z_AXIS) || normal.parallel?(Z_AXIS.reverse)
              if face.edges.all? { |edge| edge.faces.size == 1 } || is_end_face?(face, face.parent)
                end_faces << face
              end
            end
          end
          end_faces
        end

        def is_end_face?(face, entities)
          # 检查面是否为型材的端面
          normal = face.normal
          if normal.parallel?(Z_AXIS) || normal.parallel?(Z_AXIS.reverse)
            # 检查面的边界边是否都只属于一个面（表示是开放边界）
            open_edges = face.edges.select { |edge| edge.faces.length == 1 }
            return open_edges.length > 0
          end
          false
        end

        def pull_profile_length(instance, length)
          comp_ents = instance.definition.entities
          faces = comp_ents.grep(Sketchup::Face)

          # 找到垂直于Z轴的面（型材的端面）
          faces.each do |face|
            normal = face.normal
            # 检查是否垂直于Z轴（在局部坐标系中）
            if normal.parallel?(Z_AXIS) && face.edges.all? { |edge| edge.faces.size == 1 }
              # 推拉这个面
              # 总是沿着Z轴正方向推拉，因为我们已经通过旋转调整了方向
              face.pushpull(length)
              break
            end
          end
        end

        def load_profile_definition(size)
          sku_mapping = {
            "2020" => "2020.skp",
            "2040" => "2040.skp",
            "2060" => "2060.skp",
            "3030" => "3030.skp",
            "3060" => "3060.skp",
            "3090" => "3090.skp",
            "4040" => "4040.skp",
            "4080" => "4080.skp",
            "40120" => "40120.skp",
          }

          skp_path = File.join(YOOOOOO::AluPro::PROJECT_ROOT, "su-models", sku_mapping[size])

          unless File.exist?(skp_path)
            UI.messagebox("找不到对应的模型文件: #{skp_path}")
            return nil
          end

          comp_def = @model.definitions.load(skp_path)

          if comp_def.nil?
            UI.messagebox("无法加载SKP文件: #{skp_path}")
            return nil
          end

          # 处理柔滑边线，确保所有边线可见
          comp_def.entities.grep(Sketchup::Edge).each do |edge|
            edge.soft = false
            edge.smooth = false
          end

          # 为组件定义创建唯一名称
          timestamp = Time.now.to_i
          unique_name = "#{File.basename(skp_path, ".skp")}_#{timestamp}"
          comp_def.name = unique_name

          comp_def
        end

        # 移动型材的方法
        def move_profile(x_dir, y_dir)
          return unless @profile_instance

          begin
            @model.start_operation("移动型材")

            # 获取型材当前的变换矩阵
            current_transform = @profile_instance.transformation

            # 获取参考面的法线，用于确定移动平面
            ref_normal = Utils::Draw.get_face_normal(@reference_face, @reference_transformation)

            # 获取参考面和目标面的中心点
            ref_center = get_face_center(@reference_face, @reference_transformation)
            target_center = get_face_center(@target_face, @target_transformation)

            # 计算移动方向：垂直于型材轴向的平面内的移动
            # 获取型材的轴向（从参考面到目标面的方向）
            profile_axis = (target_center - ref_center).normalize

            # 计算移动平面的法线（型材轴向）
            plane_normal = profile_axis

            # 计算垂直于型材轴向的移动方向
            # 找一个与型材轴向垂直的向量
            perp_vector = find_perpendicular_vector(profile_axis)

            # 如果x_dir或y_dir非零，计算移动向量
            if x_dir != 0 || y_dir != 0
              # 创建移动方向向量
              move_vector = Geom::Vector3d.new(0, 0, 0)

              # 基于x_dir和y_dir计算移动向量
              # 这里简化处理，x_dir和y_dir代表在垂直于型材轴向的平面内的移动方向
              # 首先计算一个垂直于型材轴向的基向量
              base_vector1 = perp_vector
              # 计算第二个垂直向量（垂直于型材轴向和第一个基向量）
              base_vector2 = profile_axis.cross(base_vector1).normalize

              # 组合两个方向的移动
              move_vector = (base_vector1 * x_dir + base_vector2 * y_dir).normalize

              # 计算移动距离（型材长度的20%）
              move_distance = @profile_length * 0.2

              # 应用移动距离
              move_vector.length = move_distance

              # 创建新的变换矩阵
              new_transform = Geom::Transformation.translation(move_vector) * current_transform

              # 检查移动是否超出边界
              if within_bounds?(ref_center, target_center, new_transform)
                @profile_instance.transformation = new_transform
              else
                # 如果超出边界，尝试吸附到边界
                @profile_instance.transformation = calculate_bounded_transform(ref_center, target_center, new_transform)
              end
            end

            @model.commit_operation
          rescue => e
            @model.abort_operation
            puts "移动型材时出错: #{e.message}"
          end
        end

        # 查找垂直于给定向量的向量
        def find_perpendicular_vector(vector)
          # 尝试与X轴交叉积
          test_vector = Geom::Vector3d.new(1, 0, 0)
          if vector.parallel?(test_vector) || vector.parallel?(test_vector.reverse)
            # 如果与X轴平行，尝试Y轴
            test_vector = Geom::Vector3d.new(0, 1, 0)
            if vector.parallel?(test_vector) || vector.parallel?(test_vector.reverse)
              # 如果与Y轴平行，使用Z轴
              test_vector = Geom::Vector3d.new(0, 0, 1)
            end
          end

          perpendicular = vector.cross(test_vector).normalize
          perpendicular
        end

        # 检查型材是否在边界内
        def within_bounds?(ref_center, target_center, transform)
          # 获取型材两端在世界坐标中的位置
          profile_start = ref_center.transform(transform)
          profile_end = target_center.transform(transform)

          # 检查是否在参考面和目标面的边界内
          # 简化检查：确保型材两端仍在面上或附近
          ref_in_bounds = point_near_face?(profile_start, @reference_face, @reference_transformation)
          target_in_bounds = point_near_face?(profile_end, @target_face, @target_transformation)

          ref_in_bounds && target_in_bounds
        end

        # 检查点是否在面附近
        def point_near_face?(point, face, transformation)
          # 获取面的边界框
          face_bounds = face.bounds

          # 将点转换到面的局部坐标系中
          inv_transform = transformation ? transformation.inverse : Geom::Transformation.new
          local_point = point.transform(inv_transform)

          # 检查点是否在面的边界框内
          face_bounds.contains?(local_point)
        end

        # 计算受约束的变换
        def calculate_bounded_transform(ref_center, target_center, proposed_transform)
          # 获取型材两端在世界坐标中的位置
          profile_start = ref_center.transform(proposed_transform)
          profile_end = target_center.transform(proposed_transform)

          # 确保两端点在面上
          bounded_start = clamp_point_to_face(profile_start, @reference_face, @reference_transformation)
          bounded_end = clamp_point_to_face(profile_end, @target_face, @target_transformation)

          # 计算新的变换矩阵（将 start 移回受限位置）
          original_start_world = profile_start
          translation_vector = bounded_start - original_start_world

          Geom::Transformation.translation(translation_vector) * proposed_transform
        end

        # 将点限制在面内（轴对齐包围盒限制，保留原行为）
        def clamp_point_to_face(point, face, transformation)
          # 获取面的边界框
          face_bounds = face.bounds

          # 将点转换到面的局部坐标系
          inv_transform = transformation ? transformation.inverse : Geom::Transformation.new
          local_point = point.transform(inv_transform)

          # 将点限制在面的边界框内
          clamped_x = [[local_point.x, face_bounds.min.x].max, face_bounds.max.x].min
          clamped_y = [[local_point.y, face_bounds.min.y].max, face_bounds.max.y].min
          clamped_z = [[local_point.z, face_bounds.min.z].max, face_bounds.max.z].min

          clamped_local_point = Geom::Point3d.new(clamped_x, clamped_y, clamped_z)

          # 转换回世界坐标
          clamped_local_point.transform(transformation)
        end

        # 辅助方法 - 从面查找所属的组件实例
        # 说明：
        # - transformation 为可选参数（来自 pick_helper.transformation_at(0)）
        # - 优先返回 ComponentInstance/Group（实例），处理嵌套情况
        def find_component_from_face(face, transformation = nil)
          return nil unless face

          parent = face.parent

          # 如果 face.parent 直接就是实例或组（常见）
          return parent if parent.is_a?(Sketchup::ComponentInstance) || parent.is_a?(Sketchup::Group)

          # 如果 parent 是 Entities，尝试取其 owner（可能是 ComponentInstance/Group/ComponentDefinition/Model）
          owner = parent.respond_to?(:owner) ? parent.owner : nil

          # 如果 owner 已经是实例或组，直接返回
          return owner if owner.is_a?(Sketchup::ComponentInstance) || owner.is_a?(Sketchup::Group)

          model = @model

          # 如果 owner 是 ComponentDefinition，递归查找使用该 definition 的实例（包括嵌套）
          if owner.is_a?(Sketchup::ComponentDefinition)
            inst = find_instances_by_definition(owner, model.entities, transformation)
            return inst if inst
          end

          # 如果 face 在根实体下（owner.nil 或 owner 是 Model），尝试查找包含该 face 的实例（递归）
          inst = find_instance_containing_face(face, model.entities)
          return inst if inst

          nil
        end

        # 在给定 entities 集合（及其嵌套实例）中递归查找匹配 definition 的实例
        def find_instances_by_definition(defn, entities, transformation = nil)
          entities.each do |ent|
            if ent.is_a?(Sketchup::ComponentInstance) || ent.is_a?(Sketchup::Group)
              # 对 ComponentInstance，比较 definition
              if ent.respond_to?(:definition) && ent.definition == defn
                return ent if transformation.nil? || ent.transformation == transformation
                # 如果 transformation 不匹配，仍返回第一个（回退），但优先尝试精确匹配后再回退
                fallback = ent if fallback.nil?
              end

              # 递归：搜索子实体（Group -> ent.entities； ComponentInstance -> ent.definition.entities）
              child_entities = if ent.is_a?(Sketchup::Group)
                  ent.entities
                elsif ent.is_a?(Sketchup::ComponentInstance) && ent.definition
                  ent.definition.entities
                end

              if child_entities
                found = find_instances_by_definition(defn, child_entities, transformation)
                return found if found
              end
            end
          end

          # 如果没有精确匹配 transformation，但存在回退实例，返回它
          defined?(fallback) ? fallback : nil
        end

        # 递归查找包含指定 face 的实例（在 entities 集合及其嵌套实例中）
        def find_instance_containing_face(face, entities)
          entities.each do |ent|
            if ent.is_a?(Sketchup::ComponentInstance) || ent.is_a?(Sketchup::Group)
              # group.entities.include?(face) 或 component.definition.entities.include?(face)
              begin
                if (ent.is_a?(Sketchup::Group) && ent.entities.include?(face)) ||
                   (ent.is_a?(Sketchup::ComponentInstance) && ent.definition && ent.definition.entities.include?(face))
                  return ent
                end
              rescue
                # 某些情况下 include? 可能抛错，忽略并继续
              end

              # 递归检查子实体
              child_entities = if ent.is_a?(Sketchup::Group)
                  ent.entities
                elsif ent.is_a?(Sketchup::ComponentInstance) && ent.definition
                  ent.definition.entities
                end

              if child_entities
                found = find_instance_containing_face(face, child_entities)
                return found if found
              end
            end
          end
          nil
        end

        def get_component_name(component)
          return "未命名组件" unless component

          if component.is_a?(Sketchup::ComponentInstance) && component.definition
            return component.definition.name || "组件"
          elsif component.respond_to?(:name)
            return component.name || "组件"
          else
            return "组件"
          end
        rescue
          "组件"
        end

        # def get_face_normal(face, transformation)
        #   normal = face.normal
        #   # 复制并变换，避免修改原始法线对象
        #   n = Geom::Vector3d.new(normal.x, normal.y, normal.z)
        #   n.transform!(transformation) if transformation
        #   n.normalize
        # end

        def get_face_center(face, transformation)
          bounds = face.bounds
          center = bounds.center
          transformation ? center.transform(transformation) : center
        end

        def format_vector(vector)
          "(#{vector.x.round(2)}, #{vector.y.round(2)}, #{vector.z.round(2)})"
        end

        def reset_to_step1
          @step = 1
          @selected_component = nil
          @reference_face = nil
          @reference_transformation = nil
          @target_face = nil
          @target_transformation = nil
          @hover_face = nil
          @hover_instance = nil

          puts "已取消选择。步骤#{@step}: 请选择起点面"
        end

        def clear_highlights(view)
          @hover_face = nil
          @hover_instance = nil
          view.invalidate
        end

        def update_status_text
          case @step
          when 1
            if @hover_face
              component = @hover_instance || find_component_from_face(@hover_face, @hover_transformation)
              if component
                component_name = get_component_name(component)
                Sketchup.status_text = "步骤1: 选择起点面 (悬停在 #{component_name} 上) | 左键选择 | ESC取消"
              else
                Sketchup.status_text = "步骤1: 选择起点面 | 这个面不属于任何组件或组 | ESC取消"
              end
            else
              Sketchup.status_text = "步骤1: 选择起点面 | 移动鼠标选择面 | ESC取消"
            end
          when 2
            if @selected_component
              component_name = get_component_name(@selected_component)
              if @hover_face
                Sketchup.status_text = "步骤2: 选择终点面 | 已选择起点面: #{component_name} | 左键放置型材 | 右键取消选择 | ESC退出"
              else
                Sketchup.status_text = "步骤2: 选择终点面 | 已选择起点面: #{component_name} | 移动鼠标选择面 | 右键取消选择 | ESC退出"
              end
            end
          when 3
            Sketchup.status_text = "型材已创建 | 使用方向键移动型材 | ESC退出"
          end
        end

        def draw_hover_highlight(view)
          return unless @hover_face

          color = @step == 1 ? [0, 0, 255] : [255, 165, 0]  # 蓝色或橙色
          draw_face_highlight(view, @hover_face, @hover_transformation, color)
        end

        def draw_selected_highlights(view)
          if @reference_face
            draw_face_highlight(view, @reference_face, @reference_transformation, [0, 255, 0])  # 绿色
          end
          if @target_face && @step >= 2
            draw_face_highlight(view, @target_face, @target_transformation, [255, 0, 0])  # 红色
          end
        end

        def draw_profile_highlights(view)
          if @profile_instance
            # 绘制型材实例的边界框
            bounds = @profile_instance.bounds
            points = [
              Geom::Point3d.new(bounds.min.x, bounds.min.y, bounds.min.z),
              Geom::Point3d.new(bounds.max.x, bounds.min.y, bounds.min.z),
              Geom::Point3d.new(bounds.max.x, bounds.max.y, bounds.min.z),
              Geom::Point3d.new(bounds.min.x, bounds.max.y, bounds.min.z),
              Geom::Point3d.new(bounds.min.x, bounds.min.y, bounds.max.z),
              Geom::Point3d.new(bounds.max.x, bounds.min.y, bounds.max.z),
              Geom::Point3d.new(bounds.max.x, bounds.max.y, bounds.max.z),
              Geom::Point3d.new(bounds.min.x, bounds.max.y, bounds.max.z),
            ]

            # 绘制立方体框架
            view.line_width = 2
            view.drawing_color = Sketchup::Color.new(255, 255, 0)  # 黄色

            # 底面
            view.draw(GL_LINE_LOOP, [points[0], points[1], points[2], points[3]])
            # 顶面
            view.draw(GL_LINE_LOOP, [points[4], points[5], points[6], points[7]])
            # 连接线
            4.times { |i| view.draw(GL_LINES, [points[i], points[i + 4]]) }
          end
        end

        def draw_face_highlight(view, face, transformation, color_rgb)
          begin
            # 绘制边框
            view.line_width = 3
            view.drawing_color = Sketchup::Color.new(color_rgb[0], color_rgb[1], color_rgb[2])

            points = []
            face.outer_loop.vertices.each do |vertex|
              point = vertex.position
              point = point.transform(transformation) if transformation
              points << point
            end

            # 闭合边框
            view.draw(GL_LINE_LOOP, points)

            # 半透明填充
            mesh = face.mesh
            triangles = []

            mesh.polygons.each do |polygon|
              indices = polygon.map(&:abs)

              if indices.length == 3
                indices.each do |idx|
                  point = mesh.point_at(idx)
                  point = point.transform(transformation) if transformation
                  triangles << point
                end
              elsif indices.length == 4
                # 四边形转换为两个三角形
                [0, 1, 2, 0, 2, 3].each do |i|
                  idx = i < 3 ? indices[i] : indices[i - 3]
                  point = mesh.point_at(idx)
                  point = point.transform(transformation) if transformation
                  triangles << point
                end
              end
            end

            # 设置半透明颜色
            alpha = 80
            view.drawing_color = [color_rgb[0], color_rgb[1], color_rgb[2], alpha]
            view.draw(GL_TRIANGLES, triangles) if triangles.any?
          rescue => e
            # 静默处理绘制错误
          end
        end
      end

      # 主函数：启动快速创建工具
      def self.quick_create_profile_tool(size)
        puts "快速创建型材工具 v1.0"
        puts "型材规格: #{size}"
        puts "=" * 50
        tool = QuickCreateProfileTool.new(size)
        Sketchup.active_model.select_tool(tool)
        Sketchup::focus()
      end
    end
  end
end
