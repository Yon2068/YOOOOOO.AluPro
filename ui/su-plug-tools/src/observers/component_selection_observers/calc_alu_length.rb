# 示例Ruby代码

module YOOOOOO
  module AluPro
    module Observers

      # 设置WebDialog实例
      def self.webdialog=(dialog)
        @webdialog = dialog
      end

      def self.webdialog
        @webdialog
      end

      # 判断两个组件是否为铝型材
      def self.is_aluminum_profile?(entity)
        # 方法1: 检查实体是否为组件实例
        return false unless entity.is_a?(Sketchup::ComponentInstance)

        # 方法2: 检查组件定义名称是否包含型材特征
        definition = entity.definition
        name = definition.name.downcase

        # 检查名称中是否包含铝型材特征
        name.include?("铝型材") || name.include?("aluminum") ||
        name.include?("profile") || name.include?("extrusion") ||
          # 或者检查是否有特定的属性
        definition.get_attribute("ALUMINUM_PROFILE", "type")
      end

      # 检查两个型材是否平行
      def self.are_parallel_profiles?(profile1, profile2)
        # 检查是否为铝型材
        # return false unless is_aluminum_profile?(profile1) && is_aluminum_profile?(profile2)

        # 获取型材的主轴方向（假设型材的局部Z轴为长度方向）
        # 实际实现可能需要根据你的型材组件结构调整
        begin
          # 方法1: 通过变换矩阵获取方向
          transform1 = profile1.transformation
          transform2 = profile2.transformation

          # 获取Z轴方向向量
          z_axis1 = Geom::Vector3d.new(0, 0, 1).transform(transform1)
          z_axis2 = Geom::Vector3d.new(0, 0, 1).transform(transform2)

          # 检查方向是否平行（方向相同或相反）
          # 使用点积检查：如果点积接近1或-1，则平行
          dot_product = z_axis1.dot(z_axis2)
          return dot_product.abs > 0.98  # 允许小的角度偏差
        rescue => e
          puts "检查平行时出错: #{e.message}"
          return false
        end
      end

      # 获取型材的边界框（考虑实际几何）
      def self.get_profile_bounds(profile)
        # 获取组件的边界框
        bounds = profile.bounds

        # 如果边界框无效，尝试获取定义的实际边界
        if bounds.empty?
          bounds = profile.definition.bounds
          # 应用组件的变换
          bounds = bounds.transform(profile.transformation)
        end

        bounds
      end

      # 获取型材的截面尺寸
      def self.get_profile_size(profile)
        # 从组件名称或属性中提取尺寸
        name = profile.definition.name

        # 尝试匹配常见的型材尺寸模式：如2020, 2040, 3030等
        if match = name.match(/(\d{2})(\d{2})/)
          width = match[1].to_i  # 如20
          height = match[2].to_i # 如20
          return [width, height]
        elsif match = name.match(/(\d+)[xX](\d+)/)
          width = match[1].to_i
          height = match[2].to_i
          return [width, height]
        end

        # 默认返回常见的2020尺寸
        [20, 20]
      end

      # 计算两个型材之间的最近面距离
      def self.calculate_inner_distance(profile1, profile2)
        bounds1 = get_profile_bounds(profile1)
        bounds2 = get_profile_bounds(profile2)

        # 计算两个边界框在各自主轴方向上的距离
        # 简化处理：计算两个边界框在X、Y、Z方向上的最近距离

        # 获取两个边界框的最小点和最大点
        min1 = bounds1.min
        max1 = bounds1.max
        min2 = bounds2.min
        max2 = bounds2.max

        # 计算在各个轴上的重叠/距离
        distances = []

        # X轴方向距离
        if max1.x < min2.x # profile1在左，profile2在右
          distances << (min2.x - max1.x)
        elsif max2.x < min1.x # profile2在左，profile1在右
          distances << (min1.x - max2.x)
        else # 有重叠，最近距离为0
          distances << 0
        end

        # Y轴方向距离
        if max1.y < min2.y # profile1在前，profile2在后
          distances << (min2.y - max1.y)
        elsif max2.y < min1.y # profile2在前，profile1在后
          distances << (min1.y - max2.y)
        else # 有重叠
          distances << 0
        end

        # Z轴方向距离
        if max1.z < min2.z # profile1在下，profile2在上
          distances << (min2.z - max1.z)
        elsif max2.z < min1.z # profile2在下，profile1在上
          distances << (min1.z - max2.z)
        else # 有重叠
          distances << 0
        end

        # 返回非零的最小距离（如果所有方向都重叠，返回0）
        non_zero_distances = distances.select { |d| d > 0 }

        if non_zero_distances.empty?
          0.0
        else
          non_zero_distances.min
        end
      end

      # 计算两个型材之间的最远面距离
      def self.calculate_outer_distance(profile1, profile2)
        bounds1 = get_profile_bounds(profile1)
        bounds2 = get_profile_bounds(profile2)

        # 计算两个边界框最远点之间的距离

        # 获取两个边界框的中心点
        center1 = bounds1.center
        center2 = bounds2.center

        # 获取两个型材的尺寸
        size1 = get_profile_size(profile1)
        size2 = get_profile_size(profile2)

        # 简化为：中心距离 + 两个型材的半宽度
        # 这假设型材是平行放置的

        # 计算中心距离
        center_distance = center1.distance(center2)

        # 估算型材的"半径"（最大截面尺寸的一半）
        radius1 = [size1[0], size1[1]].max / 2.0
        radius2 = [size2[0], size2[1]].max / 2.0

        # 最远距离 = 中心距离 + 两个半径
        center_distance + radius1 + radius2
      end

      # 计算两个型材中心之间的距离
      def self.calculate_center_distance(profile1, profile2)
        bounds1 = get_profile_bounds(profile1)
        bounds2 = get_profile_bounds(profile2)

        # 计算两个边界框中心点之间的距离
        center1 = bounds1.center
        center2 = bounds2.center

        center1.distance(center2)
      end

      # 主检查函数
      def self.check_parallel_profiles
        model = Sketchup.active_model
        selection = model.selection

        if selection.length == 2
          # 检查两个组件是否为铝型材且平行
          profile1 = selection[0]
          profile2 = selection[1]

          if are_parallel_profiles?(profile1, profile2)
            puts "检测到两个平行铝型材"

            # 计算三种距离（单位：mm）
            inner_distance = calculate_inner_distance(profile1, profile2).mm
            outer_distance = calculate_outer_distance(profile1, profile2).mm
            center_distance = calculate_center_distance(profile1, profile2).mm

            puts "最近面距离: #{inner_distance}mm"
            puts "最远面距离: #{outer_distance}mm"
            puts "中心距离: #{center_distance}mm"

            # 调用UI更新函数
            update_ui_with_distances(inner_distance, outer_distance, center_distance)
          else
            puts "选择的两个组件不是平行铝型材"
            # 不是平行型材，清除UI的横梁状态
            clear_ui_beam_state
          end
        else
          puts "选择了 #{selection.length} 个组件，需要选择2个"
          # 选择不是2个，清除UI的横梁状态
          clear_ui_beam_state
        end
      rescue => e
        puts "检查平行型材时出错: #{e.message}"
        puts e.backtrace.join("\n")
        clear_ui_beam_state
      end

      def self.update_ui_with_distances(inner, outer, center)
        # 调用JavaScript函数更新UI
        js_code = "onParallelProfilesSelected(#{inner}, #{outer}, #{center})"

        puts "调用JavaScript: #{js_code}"

        # 假设webdialog是你的WebDialog实例
        if @webdialog
          @webdialog.execute_script(js_code)
        else
          puts "WebDialog未设置"
        end
      end

      def self.clear_ui_beam_state
        puts "清除UI横梁状态"

        # 调用JavaScript函数清除横梁状态
        if @webdialog
          @webdialog.execute_script("clearBeamSelection()")
        end
      end

      # 创建横梁的命令
      def self.create_beam(size, length, unit, mode, distance)
        puts "创建横梁命令:"
        puts "  尺寸: #{size}"
        puts "  长度: #{length} #{unit}"
        puts "  模式: #{mode}"
        puts "  距离: #{distance}"

        # 将长度转换为毫米
        length_mm = case unit.downcase
          when "m" then length.to_f * 1000
          when "cm" then length.to_f * 10
          else length.to_f  # 假设已经是mm
          end

        model = Sketchup.active_model
        selection = model.selection

        # 确保选择了两个型材
        if selection.length != 2
          UI.messagebox("请选择两个铝型材来创建横梁")
          return
        end

        profile1 = selection[0]
        profile2 = selection[1]

        unless are_parallel_profiles?(profile1, profile2)
          UI.messagebox("选择的两个型材不平行")
          return
        end

        # 开始创建操作
        model.start_operation("创建横梁", true)

        begin
          # 1. 获取两个型材的位置信息
          bounds1 = get_profile_bounds(profile1)
          bounds2 = get_profile_bounds(profile2)

          # 2. 确定横梁的位置（根据模式）
          position = calculate_beam_position(profile1, profile2, mode)

          # 3. 创建横梁组件（这里需要你的型材创建逻辑）
          beam = create_aluminum_profile(size, length_mm)

          # 4. 放置横梁
          place_beam_between_profiles(beam, profile1, profile2, mode)

          # 操作成功完成
          model.commit_operation

          # 更新状态
          model.selection.clear
          model.selection.add(beam)

          puts "横梁创建成功"
        rescue => e
          model.abort_operation
          UI.messagebox("创建横梁时出错: #{e.message}")
          puts e.backtrace.join("\n")
        end
      end

      # 计算横梁位置
      def self.calculate_beam_position(profile1, profile2, mode)
        bounds1 = get_profile_bounds(profile1)
        bounds2 = get_profile_bounds(profile2)

        case mode
        when "inner"
          # 放置在两个型材的最近面之间
          # 简化处理：取两个边界框的中间位置
          min_point = [
            [bounds1.min.x, bounds2.min.x].max,
            [bounds1.min.y, bounds2.min.y].max,
            [bounds1.min.z, bounds2.min.z].max,
          ]

          max_point = [
            [bounds1.max.x, bounds2.max.x].min,
            [bounds1.max.y, bounds2.max.y].min,
            [bounds1.max.z, bounds2.max.z].min,
          ]

          Geom::Point3d.new(
            (min_point[0] + max_point[0]) / 2,
            (min_point[1] + max_point[1]) / 2,
            (min_point[2] + max_point[2]) / 2
          )
        when "outer"
          # 放置在两个型材的最远面之间
          # 取两个边界框的外侧中间位置
          center1 = bounds1.center
          center2 = bounds2.center

          Geom::Point3d.new(
            (center1.x + center2.x) / 2,
            (center1.y + center2.y) / 2,
            (center1.z + center2.z) / 2
          )
        when "center"
          # 放置在两个型材的中心之间
          center1 = bounds1.center
          center2 = bounds2.center

          Geom::Point3d.new(
            (center1.x + center2.x) / 2,
            (center1.y + center2.y) / 2,
            (center1.z + center2.z) / 2
          )
        else
          bounds1.center
        end
      end

      # 创建铝型材组件（这里需要根据你的实际创建逻辑实现）
      def self.create_aluminum_profile(size, length_mm)
        model = Sketchup.active_model
        entities = model.active_entities

        # 解析尺寸，如"2020" -> 20x20
        width = size[0..1].to_i
        height = size[2..3].to_i

        # 创建组
        group = entities.add_group

        # 创建矩形截面
        points = [
          [0, 0, 0],
          [width, 0, 0],
          [width, height, 0],
          [0, height, 0],
        ]

        face = group.entities.add_face(points)

        # 拉伸成长方体
        face.pushpull(length_mm)

        # 添加组件属性
        group.definition.name = "#{size}铝型材"
        group.definition.set_attribute("ALUMINUM_PROFILE", "type", size)
        group.definition.set_attribute("ALUMINUM_PROFILE", "length", length_mm)

        group
      end

      # 放置横梁在两个型材之间
      def self.place_beam_between_profiles(beam, profile1, profile2, mode)
        # 获取两个型材的方向
        transform1 = profile1.transformation
        transform2 = profile2.transformation

        # 确定横梁的方向（垂直于两个型材的连接方向）
        # 这里需要根据实际布局确定

        # 简单实现：将横梁放置在两个型材之间，方向与其中一个型材相同
        beam.transform!(profile1.transformation)

        # 调整位置（这里需要更精确的定位逻辑）
        bounds1 = get_profile_bounds(profile1)
        bounds2 = get_profile_bounds(profile2)

        # 计算中间点
        mid_point = Geom::Point3d.new(
          (bounds1.center.x + bounds2.center.x) / 2,
          (bounds1.center.y + bounds2.center.y) / 2,
          (bounds1.center.z + bounds2.center.z) / 2
        )

        # 移动横梁到中间位置
        current_origin = beam.bounds.center
        translation = Geom::Vector3d.new(
          mid_point.x - current_origin.x,
          mid_point.y - current_origin.y,
          mid_point.z - current_origin.z
        )

        beam.transform!(Geom::Transformation.translation(translation))
      end

      # 注册选择观察者
      def self.register_selection_observer
        model = Sketchup.active_model

        # 移除现有的观察者（如果存在）
        @selection_observer&.remove_observer

        # 创建新的观察者
        @selection_observer = SelectionObserver.new
        model.selection.add_observer(@selection_observer)

        puts "已注册选择观察者"
      end

      # 选择观察者类
      class SelectionObserver < Sketchup::SelectionObserver
        def onSelectionAdded(selection, entity)
          check_selection(selection)
        end

        def onSelectionRemoved(selection, entity)
          check_selection(selection)
        end

        def onSelectionCleared(selection)
          YOOOOOO::AluPro::Observers.clear_ui_beam_state
        end

        def onSelectionBulkChange(selection)
          check_selection(selection)
        end

        private

        def check_selection(selection)
          # 延迟检查，避免频繁触发
          UI.start_timer(0.1, false) do
            YOOOOOO::AluPro::Observers.check_parallel_profiles
          end
        end
      end
    end
  end
end
