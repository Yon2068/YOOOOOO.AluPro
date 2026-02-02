# src/yoooo_aluminum/ui/callbacks.rb
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
