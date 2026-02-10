module YOOOOOO
  module AluPro
    module Utils
      module Draw
        # 绘制组件的高亮边框
        def self.draw_component_highlight(view, component)
          # 绘制组件的边界框
          bounds = component.bounds
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
          view.drawing_color = Sketchup::Color.new(0, 255, 0)  # 绿色

          # 底面
          view.draw(GL_LINE_LOOP, [points[0], points[1], points[2], points[3]])
          # 顶面
          view.draw(GL_LINE_LOOP, [points[4], points[5], points[6], points[7]])
          # 连接线
          4.times { |i| view.draw(GL_LINES, [points[i], points[i + 4]]) }
        end

        # 绘制组件六个面的高亮（带透明度）
        def self.draw_component_face_highlight(view, component, color_rgb = [0, 255, 0], alpha = 200)
          bounds = component.bounds

          # 定义立方体的8个顶点
          points = [
            Geom::Point3d.new(bounds.min.x, bounds.min.y, bounds.min.z),  # 0: 左下前
            Geom::Point3d.new(bounds.max.x, bounds.min.y, bounds.min.z),  # 1: 右下前
            Geom::Point3d.new(bounds.max.x, bounds.max.y, bounds.min.z),  # 2: 右上前
            Geom::Point3d.new(bounds.min.x, bounds.max.y, bounds.min.z),  # 3: 左上前
            Geom::Point3d.new(bounds.min.x, bounds.min.y, bounds.max.z),  # 4: 左下后
            Geom::Point3d.new(bounds.max.x, bounds.min.y, bounds.max.z),  # 5: 右下后
            Geom::Point3d.new(bounds.max.x, bounds.max.y, bounds.max.z),  # 6: 右上后
            Geom::Point3d.new(bounds.min.x, bounds.max.y, bounds.max.z),  # 7: 左上后
          ]

          # 设置绘制颜色（带透明度）
          view.drawing_color = Sketchup::Color.new(color_rgb[0], color_rgb[1], color_rgb[2], alpha)

          # 绘制六个面
          # 前面
          view.draw(GL_QUADS, [points[0], points[1], points[2], points[3]])
          # 后面
          view.draw(GL_QUADS, [points[5], points[4], points[7], points[6]])
          # 左面
          view.draw(GL_QUADS, [points[4], points[0], points[3], points[7]])
          # 右面
          view.draw(GL_QUADS, [points[1], points[5], points[6], points[2]])
          # 顶面
          view.draw(GL_QUADS, [points[3], points[2], points[6], points[7]])
          # 底面
          view.draw(GL_QUADS, [points[4], points[5], points[1], points[0]])

          # 可选：同时绘制边框线以更清晰地显示边界
          view.line_width = 1
          view.drawing_color = Sketchup::Color.new(color_rgb[0], color_rgb[1], color_rgb[2])

          # 绘制边框
          # 底面边框
          view.draw(GL_LINE_LOOP, [points[0], points[1], points[2], points[3]])
          # 顶面边框
          view.draw(GL_LINE_LOOP, [points[4], points[5], points[6], points[7]])
          # 连接线
          view.draw(GL_LINES, [points[0], points[4]])
          view.draw(GL_LINES, [points[1], points[5]])
          view.draw(GL_LINES, [points[2], points[6]])
          view.draw(GL_LINES, [points[3], points[7]])
        end

        # 绘制面的高亮边框和半透明填充
        def self.draw_face_highlight(view, face, transformation, color_rgb)
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

        # 设置组件透明度
        def self.set_component_transparency(component, alpha = 100)
          # 确保 alpha 值在有效范围内 (0-255)
          alpha = [[alpha, 0].max, 255].min

          # 获取或创建一个材料用于设置透明度
          material = nil

          # 检查组件是否已有材料
          if component.material
            material = component.material
          else
            # 创建新材质
            material = Sketchup.active_model.materials.add
            component.material = material
          end

          # 设置材质的透明度
          material.alpha = alpha / 255.0

          # 如果组件有背面材质，也设置其透明度
          if component.back_material
            component.back_material.alpha = alpha / 255.0
          else
            # 如果没有背面材质，创建一个并设置
            back_material = Sketchup.active_model.materials.add
            back_material.alpha = alpha / 255.0
            component.back_material = back_material
          end

          # 刷新模型以显示更改
          # Sketchup.active_model.refresh_if_visible
        end

        # 验证组件是否面对齐
        def self.validate_components_alignment(face, transformation, target_components)
          ref_normal = get_face_normal(face, transformation)

          # 遍历所有选中的组件
          target_components.each do |component|
            # 获取组件实例中的面
            component_faces = component.entities.grep(Sketchup::Face)
            has_parallel_face = false
            # 遍历组件中的面
            component_faces.each do |face|
              component_normal = get_face_normal(face, component.transformation)
              # dot_product = ref_normal.dot(component_normal)
              # 检查是否平行
              if ref_normal.parallel?(component_normal)
                has_parallel_face = true
                break
              end
            end

            unless has_parallel_face
              return false
            end
          end

          true
        end

        # 获取面的法线并应用变换
        def self.get_face_normal(face, transformation)
          normal = face.normal
          # 复制并变换，避免修改原始法线对象
          n = Geom::Vector3d.new(normal.x, normal.y, normal.z)
          n.transform!(transformation) if transformation
          n.normalize
        end

        # 获取面的中心点并应用变换
        def self.get_face_center(face, transformation)
          bounds = face.bounds
          center = bounds.center
          transformation ? center.transform(transformation) : center
        end

        # 根据面法线夹角柔化/平滑边线
        # @param entities [Sketchup::Entities] 实体集合
        # @param angle_threshold [Float] 角度阈值（以弧度为单位），默认15度
        def self.soften_edges_by_angle(entities, angle_threshold = 15.degrees)
          edges = entities.grep(Sketchup::Edge)

          edges.each do |edge|
            if edge.faces.length == 2 # 确保边线连接两个面
              face1, face2 = edge.faces

              # 计算两个面法线之间的夹角
              angle_between_normals = face1.normal.angle_between(face2.normal)

              # 如果夹角小于阈值，则柔化/平滑边线
              if angle_between_normals <= angle_threshold
                edge.soft = true
                edge.smooth = true
              else
                edge.soft = false
                edge.smooth = false
              end
            else
              # 对于只连接一个面的边界边，通常不柔化/平滑
              edge.soft = false
              edge.smooth = false
            end
          end
        end

        # 对组件实例的边线根据面法线夹角进行柔化/平滑
        # @param instance [Sketchup::ComponentInstance] 组件实例
        # @param angle_threshold [Float] 角度阈值（以弧度为单位），默认15度
        def self.soften_edges_by_angle_for_instance(instance, angle_threshold = 15.degrees)
          self.soften_edges_by_angle(instance.definition.entities, angle_threshold)
        end
      end
    end
  end
end
