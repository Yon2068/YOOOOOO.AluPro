require_relative "../utils/draw"

module YOOOOOO
  module AluPro
    module Core

      # 型材放置工具类 - 完整三轴控制
      class CreateProfileTool
        def initialize(size, length, unit)
          @preview_instance = nil
          @preview_group = nil
          @ip = Sketchup::InputPoint.new

          # 分别记录绕三个轴的旋转角度
          @x_rotation_angle = 0.degrees
          @y_rotation_angle = 0.degrees
          @z_rotation_angle = 0.degrees

          # 定义每个数字键对应的固定旋转角度
          @rotation_presets = {
            "1" => { x: 0, y: 0, z: 0 },
            "2" => { x: 0, y: 0, z: 90 },
            "3" => { x: 90, y: 0, z: 90 },
            "4" => { x: 90, y: 90, z: 90 },
            "5" => { x: 90, y: 0, z: 0 },
            "6" => { x: 90, y: 90, z: 0 },
          }
          load_skp(size, length, unit)
          Sketchup.active_model.select_tool(self)
          Sketchup::focus()
          # 存储当前工具的状态
          @tool_active = true
        end

        def activate
          update_status_text
          Sketchup.active_model.selection.clear
          @tool_active = true
        end

        def deactivate(view)
          clear_preview(view)
          view.invalidate
          @tool_active = false
        end

        def onKeyDown(key, repeat, flags, view)
          key_char = key.chr rescue nil

          if key_char && ("1".."6").include?(key_char) && @rotation_presets[key_char]
            preset = @rotation_presets[key_char]
            @x_rotation_angle = preset[:x].degrees
            @y_rotation_angle = preset[:y].degrees
            @z_rotation_angle = preset[:z].degrees
            update_preview(view)
            return true
          elsif key == VK_ESCAPE
            Sketchup.active_model.select_tool(nil)
            return true
          end

          false
        end

        def onMouseMove(flags, x, y, view)
          @ip.pick(view, x, y)
          update_preview(view)
          view.invalidate
        end

        def onLButtonDown(flags, x, y, view)
          place_final_instance(view)
          Sketchup.active_model.select_tool(nil)
        end

        private

        def clear_preview(view)
          if @preview_instance && @preview_instance.valid?
            # 使用临时操作来清理预览，不记录到撤销堆栈
            model = view.model
            model.start_operation("Clear Preview", true)
            @preview_instance.erase!
            model.commit_operation
          end

          if @preview_group && @preview_group.valid?
            model = view.model
            model.start_operation("Clear Preview Group", true)
            @preview_group.erase!
            model.commit_operation
          end

          @preview_instance = nil
          @preview_group = nil
        end

        def update_status_text
          x_deg = (@x_rotation_angle.radians).round(1) % 360
          y_deg = (@y_rotation_angle.radians).round(1) % 360
          z_deg = (@z_rotation_angle.radians).round(1) % 360
          Sketchup.status_text = "快捷键: 1-复位 2-绕蓝轴(Z)90° 3-绕X+Z轴90° 4-绕X+Y+Z轴90° 5-绕红轴(X)90° 6-绕X+Y轴90° | 当前角度(X/Y/Z): #{x_deg}°/#{y_deg}°/#{z_deg}° | 左键放置 | ESC取消"
        end

        def get_transform_for_orientation(position)
          x_rotation = Geom::Transformation.rotation([0, 0, 0], [1, 0, 0], @x_rotation_angle)
          y_rotation = Geom::Transformation.rotation([0, 0, 0], [0, 1, 0], @y_rotation_angle)
          z_rotation = Geom::Transformation.rotation([0, 0, 0], [0, 0, 1], @z_rotation_angle)

          final_transform = x_rotation
          final_transform = y_rotation * final_transform
          final_transform = z_rotation * final_transform
          final_transform = Geom::Transformation.new(position) * final_transform

          return final_transform
        end

        def update_preview(view)
          clear_preview(view)
          return unless @ip.position && @tool_active

          model = view.model

          # 方法1：使用组作为预览（组不会被自动保存为组件定义）
          begin
            # 创建一个临时操作，不会被撤销
            model.start_operation("Preview Update", true)

            # 创建一个组
            @preview_group = model.active_entities.add_group

            # 在组内添加原始组件定义的实例
            transform = get_transform_for_orientation(@ip.position)
            instance_in_group = @preview_group.entities.add_instance(@original_def, transform)

            # 推拉组内的面
            instance_in_group.definition.entities.grep(Sketchup::Face).each do |face|
              if face.edges.all? { |edge| edge.faces.size == 1 } && face.normal.length > 0
                face.pushpull(@pull_length)
              end
            end

            # 处理柔滑边线，显示所有边线
            Utils::Draw.soften_edges_by_angle_for_instance(instance_in_group)
            # instance_in_group.definition.entities.grep(Sketchup::Edge).each do |edge|
            #   edge.soft = false
            #   edge.smooth = false
            # end

            # 设置组为半透明绿色
            @preview_group.material = [0, 255, 0, 128]

            model.commit_operation
          rescue => e
            model.abort_operation
            puts "预览更新失败: #{e.message}"
          end

          update_status_text
        end

        def place_final_instance(view)
          return unless @ip.position

          model = Sketchup.active_model

          # 清除预览
          clear_preview(view)

          # 开始一个可撤销的操作 - 这是整个放置过程唯一的撤销操作
          model.start_operation("放置型材")

          begin
            # 步骤1：创建唯一的组件定义名称
            timestamp = Time.now.to_f.to_s.gsub(".", "")
            unique_name = "#{@original_def.name}_#{timestamp}"

            # 步骤2：创建新的组件定义
            new_def = model.definitions.add(unique_name)

            # 步骤3：将原始定义的几何体复制到新定义中
            temp_instance = new_def.entities.add_instance(@original_def, Geom::Transformation.new)
            temp_instance.explode

            # 步骤4：创建最终实例
            transform = get_transform_for_orientation(@ip.position)
            final_instance = model.active_entities.add_instance(new_def, transform)

            # 步骤5：推拉操作
            comp_ents = final_instance.definition.entities
            faces = comp_ents.grep(Sketchup::Face)
            faces.each do |face|
              if face.edges.all? { |edge| edge.faces.size == 1 } && face.normal.length > 0
                face.pushpull(@pull_length)
              end
            end

            model.commit_operation

            # 输出信息
            x_deg = (@x_rotation_angle.radians).round(1) % 360
            y_deg = (@y_rotation_angle.radians).round(1) % 360
            z_deg = (@z_rotation_angle.radians).round(1) % 360
            puts "型材已放置，旋转角度(X/Y/Z): #{x_deg}°/#{y_deg}°/#{z_deg}°，长度: #{@pull_length}"
          rescue => e
            model.abort_operation
            puts "放置型材时出错: #{e.message}"
            UI.messagebox("放置失败: #{e.message}")
          end
        end

        def load_skp(size, length, unit)
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

          # 验证文件存在
          unless File.exist?(skp_path)
            UI.messagebox("找不到对应的模型文件")
            return
          end

          # 加载组件定义
          @original_def = Sketchup.active_model.definitions.load(skp_path)
          puts @original_def
          if @original_def.nil?
            UI.messagebox("无法加载SKP文件。")
            return
          end

          @pull_length = length.to_f.send(unit.downcase)
          puts "转换后的拉伸长度: #{@pull_length}"
          # 为组件定义创建一个唯一名称，避免多次导入时的冲突
          timestamp = Time.now.to_i
          unique_name = "#{File.basename(skp_path, ".skp")}_#{timestamp}"
          @original_def.name = unique_name
        end
      end
    end
  end
end
