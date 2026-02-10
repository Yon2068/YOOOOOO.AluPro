# src/yoooo_aluminum/ui/callbacks.rb
require_relative "../core/quick-create-profile-tool"
require_relative "../core/create-profile-tool"
require_relative "../core/snap-to-face-tool"
require_relative "../core/rotate-tool"

module YOOOOOO
  module AluPro
    module UI
      module Callbacks
        extend self
        # 注册所有回调到对话框
        def register_all(dialog)
          # 创建工具(快速)
          dialog.add_action_callback("quick_create_profile") do |_dialog, params|

            # 解析参数：规格|长度|单位
            size = params
            puts "收到 quick_create_profile 回调，参数: #{size}"
            # 调用核心功能模块

            Core::QuickCreateProfileTool.new(size)
          end
          @callback_count = callback_count + 1

          # 创建工具
          dialog.add_action_callback("create_profile") do |_dialog, params|

            # 解析参数：规格|长度|单位
            size, length, unit = params.split("|")
            puts "收到 create_profile 回调，参数: #{size}, #{length}, #{unit}"
            # 调用核心功能模块
            Core::CreateProfileTool.new(size, length.to_f, unit)
          end
          @callback_count = callback_count + 1

          # 旋转工具
          dialog.add_action_callback("rotate_tool") do |_dialog, params|
            direction = params
            puts "收到 rotate_tool 回调"
            # 调用核心功能模块
            Core::RotateTool.new(direction)
          end
          @callback_count = callback_count + 1

          # 吸附工具
          dialog.add_action_callback("snap_to_face_tool") do |_dialog, params|
            is_copy = params == "true"
            puts is_copy
            puts "收到 snap_to_face_tool 回调"
            # 调用核心功能模块
            Core::SnapToFaceTool.new(is_copy)
          end
          @callback_count = callback_count + 1

          dialog.add_action_callback("get_local_version") do |_dialog, _params|
            version = YOOOOOO::AluPro.extension_version.to_s
            safe_version = version.gsub("'", "\\\\'")
            script = "if(window.onLocalVersion) { window.onLocalVersion('#{safe_version}'); }"
            dialog.execute_script(script)
          end
          @callback_count = callback_count + 1

          # 检查更新
          dialog.add_action_callback("check_for_update") do |_dialog, _params|
            puts "收到 check_for_update 回调"
            # 在非阻塞线程中运行，避免卡顿UI (注意: SketchUp Ruby是单线程的，这里只是逻辑分离)
            # 实际请求会阻塞，但在回调里通常可以接受
            begin
              result = Updater.check_for_update(YOOOOOO::AluPro.extension_version)
              json_result = result ? result.to_json : "null"
              script = "if(window.onUpdateCheckResult) { window.onUpdateCheckResult(#{json_result}); }"
              dialog.execute_script(script)
            rescue => e
              puts "Update check error: #{e.message}"
            end
          end
          @callback_count = callback_count + 1

          # 执行更新
          dialog.add_action_callback("perform_update") do |_dialog, download_url|
            puts "收到 perform_update 回调: #{download_url}"
            dialog.execute_script("if(window.onUpdateStatus) { window.onUpdateStatus('正在下载更新...', true); }")

            # 使用 timer 避免阻塞 UI 渲染
            ::UI.start_timer(0.1, false) {
              result = Updater.perform_update(download_url)
              unless result[:success]
                msg = result[:message].gsub("'", "\\'")
                dialog.execute_script("alert('更新失败: #{msg}');")
                dialog.execute_script("if(window.onUpdateStatus) { window.onUpdateStatus('更新失败', false); }")
              end
            }
          end
          @callback_count = callback_count + 1

          puts "已注册 #{callback_count} 个回调函数"
        end

        private

        # 统计已注册的回调数量
        def callback_count
          @callback_count ||= 0
        end

        # 日志辅助方法
        def log_callback(callback_name, message)
          timestamp = Time.now.strftime("%H:%M:%S")
          puts "[#{timestamp}] 回调 #{callback_name}: #{message}"
        end
      end
    end
  end
end
