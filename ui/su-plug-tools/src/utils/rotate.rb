module YOOOOOO
  module AluPro
    module Utils
      module Rotate
        # 旋转方法：沿组件的正面旋转90度
        def self.rotate_front_face(instance, model)
          return unless instance

          begin
            model.start_operation("正面旋转90度")

            # 获取组件当前的变换矩阵
            current_transform = instance.transformation

            # 获取组件在世界坐标系中的正面法线（通常是Y轴方向）
            # 在组件的局部坐标系中，正面通常是Y轴正方向
            local_front_normal = Geom::Vector3d.new(0, 1, 0)
            # 将局部坐标系的正面法线转换为世界坐标系
            world_front_normal = local_front_normal.transform(current_transform)

            # 获取组件的正面（Y轴正方向的面）作为旋转中心
            face_center = find_face_center_by_normal(instance, local_front_normal, current_transform)

            # 如果无法找到特定面，则使用组件的中心
            unless face_center
              bounds = instance.bounds
              center_point = bounds.center
              face_center = center_point.transform(current_transform)
            end

            # 创建绕正面法线旋转90度的变换
            rotation = Geom::Transformation.rotation(face_center, world_front_normal, 90.degrees)

            # 应用旋转变换
            new_transform = rotation * current_transform
            instance.transformation = new_transform

            model.commit_operation
            puts "已沿正面旋转90度"
          rescue => e
            model.abort_operation
            puts "正面旋转时出错: #{e.message}"
          end
        end

        # 旋转方法：沿组件的侧面旋转90度
        def self.rotate_side_face(instance, model)
          return unless instance

          begin
            model.start_operation("侧面旋转90度")

            # 获取组件当前的变换矩阵
            current_transform = instance.transformation

            # 获取组件在世界坐标系中的侧面法线（通常是X轴方向）
            # 在组件的局部坐标系中，侧面通常是X轴正方向
            local_side_normal = Geom::Vector3d.new(1, 0, 0)
            # 将局部坐标系的侧面法线转换为世界坐标系
            world_side_normal = local_side_normal.transform(current_transform)

            # 获取组件的侧面（X轴正方向的面）作为旋转中心
            face_center = find_face_center_by_normal(instance, local_side_normal, current_transform)

            # 如果无法找到特定面，则使用组件的中心
            unless face_center
              bounds = instance.bounds
              center_point = bounds.center
              face_center = center_point.transform(current_transform)
            end

            # 创建绕侧面法线旋转90度的变换
            rotation = Geom::Transformation.rotation(face_center, world_side_normal, 90.degrees)

            # 应用旋转变换
            new_transform = rotation * current_transform
            instance.transformation = new_transform

            model.commit_operation
            puts "已沿侧面旋转90度"
          rescue => e
            model.abort_operation
            puts "侧面旋转时出错: #{e.message}"
          end
        end

        # 旋转方法：沿组件的顶面旋转90度
        def self.rotate_top_face(instance, model)
          return unless instance

          begin
            model.start_operation("顶面旋转90度")

            # 获取组件当前的变换矩阵
            current_transform = instance.transformation

            # 获取组件在世界坐标系中的顶面法线（通常是Z轴方向）
            # 在组件的局部坐标系中，顶面通常是Z轴正方向
            local_top_normal = Geom::Vector3d.new(0, 0, 1)
            # 将局部坐标系的顶面法线转换为世界坐标系
            world_top_normal = local_top_normal.transform(current_transform)

            # 获取组件的顶面（Z轴正方向的面）作为旋转中心
            face_center = find_face_center_by_normal(instance, local_top_normal, current_transform)

            # 如果无法找到特定面，则使用组件的中心
            unless face_center
              bounds = instance.bounds
              center_point = bounds.center
              face_center = center_point.transform(current_transform)
            end

            # 创建绕顶面法线旋转90度的变换
            rotation = Geom::Transformation.rotation(face_center, world_top_normal, 90.degrees)

            # 应用旋转变换
            new_transform = rotation * current_transform
            instance.transformation = new_transform

            model.commit_operation
            puts "已沿顶面旋转90度"
          rescue => e
            model.abort_operation
            puts "顶面旋转时出错: #{e.message}"
          end
        end

        private

        # 根据法线方向找到组件上对应面的中心
        def self.find_face_center_by_normal(instance, local_normal, instance_transform)
          # 获取组件定义中的所有面
          faces = instance.definition.entities.grep(Sketchup::Face)

          # 找到与指定法线方向最接近的面
          target_face = nil
          min_angle = Float::INFINITY

          faces.each do |face|
            # 获取面的法线并转换到世界坐标系
            face_normal = face.normal
            world_face_normal = face_normal.transform(instance_transform)

            # 将局部法线也转换到世界坐标系进行比较
            world_local_normal = local_normal.transform(instance_transform)

            # 计算两个法线之间的角度
            angle = world_face_normal.angle_between(world_local_normal)
            opposite_angle = world_face_normal.angle_between(world_local_normal.reverse)

            # 取较小的角度
            actual_angle = [angle, opposite_angle].min

            # 如果角度最小，则更新目标面
            if actual_angle < min_angle
              min_angle = actual_angle
              target_face = face
            end
          end

          # 如果找到了对应的面，返回其中心点
          if target_face
            # 获取面的边界框中心
            bounds = target_face.bounds
            center = bounds.center

            # 将面的中心点转换到世界坐标系
            center.transform(instance_transform)
          else
            nil
          end
        end
      end
    end
  end
end
