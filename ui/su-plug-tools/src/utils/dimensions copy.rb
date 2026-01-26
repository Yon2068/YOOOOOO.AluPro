module YOOOOOO
  module AluPro
    module Utils
      module Dimensions
        def self.measure_component_exact(component)
          return unless component && component.valid?

          # 直接使用组件实例的边界框，这是最准确的方式
          bounds = component.bounds

          return if bounds.empty?

          # 获取边界框的最小和最大点
          min_point = bounds.min
          max_point = bounds.max

          # 计算尺寸（SketchUp内部单位，通常是英寸）
          length_x = max_point.x - min_point.x
          width_y = max_point.y - min_point.y
          height_z = max_point.z - min_point.z

          # 使用 SketchUp 的格式化函数进行单位转换
          length_mm = Sketchup.format_length(length_x, Length::Millimeter).to_f
          width_mm = Sketchup.format_length(width_y, Length::Millimeter).to_f
          height_mm = Sketchup.format_length(height_z, Length::Millimeter).to_f

          # 获取组件定义信息
          definition = component.definition

          # 输出结果
          puts "=" * 40
          puts "组件精确尺寸测量："
          puts "组件名称: #{definition.name || "未命名"}"
          puts "组件GUID: #{definition.guid}"
          puts "-" * 40
          puts "长度(X方向): #{length_mm} mm"
          puts "宽度(Y方向): #{width_mm} mm"
          puts "高度(Z方向): #{height_mm} mm"
          puts "=" * 40

          # 返回毫米单位的尺寸
          {
            length_x: length_mm,
            width_y: width_mm,
            height_z: height_mm,
            min_point: min_point,
            max_point: max_point,
            world_bounds: bounds,
          }
        end

        # 更简单的版本：直接使用组件实例的边界框
        def self.get_component_dimensions_simple(component)
          return unless component && component.valid?

          bounds = component.bounds
          return if bounds.empty?

          # 获取边界框的最小和最大点
          min_point = bounds.min
          max_point = bounds.max

          # 计算尺寸（SketchUp内部单位，通常是英寸）
          width_x = max_point.x - min_point.x
          height_y = max_point.y - min_point.y
          depth_z = max_point.z - min_point.z

          # 使用 SketchUp 的格式化函数进行单位转换
          length_mm = Sketchup.format_length(width_x, Length::Millimeter).to_f
          width_mm = Sketchup.format_length(height_y, Length::Millimeter).to_f
          height_mm = Sketchup.format_length(depth_z, Length::Millimeter).to_f

          dimensions = {
            length_x: length_mm,
            width_y: width_mm,
            height_z: height_mm,
            bounds: bounds,
          }

          puts "组件尺寸："
          puts "长度(X方向): #{dimensions[:length_x]} mm"
          puts "宽度(Y方向): #{dimensions[:width_y]} mm"
          puts "高度(Z方向): #{dimensions[:height_z]} mm"

          return dimensions
        end

        # 纯几何计算方法，返回内部单位
        def self.calculate_component_dimensions_raw(component)
          return unless component && component.valid?

          bounds = component.bounds
          return if bounds.empty?

          # 获取边界框的最小和最大点
          min_point = bounds.min
          max_point = bounds.max

          # 计算尺寸（SketchUp内部单位，通常是英寸）
          {
            length_x: (max_point.x - min_point.x).to_f,
            width_y: (max_point.y - min_point.y).to_f,
            height_z: (max_point.z - min_point.z).to_f,
            min_point: min_point,
            max_point: max_point,
          }
        end

        # 专门用于返回毫米单位的尺寸测量方法
        def self.measure_component_exact_mm(component)
          raw_dimensions = calculate_component_dimensions_raw(component)
          return nil unless raw_dimensions

          # 使用 SketchUp 的格式化函数进行单位转换
          {
            length_x: Sketchup.format_length(raw_dimensions[:length_x], Length::Millimeter).to_f,
            width_y: Sketchup.format_length(raw_dimensions[:width_y], Length::Millimeter).to_f,
            height_z: Sketchup.format_length(raw_dimensions[:height_z], Length::Millimeter).to_f,
            min_point: raw_dimensions[:min_point],
            max_point: raw_dimensions[:max_point],
          }
        end
      end
    end
  end
end
