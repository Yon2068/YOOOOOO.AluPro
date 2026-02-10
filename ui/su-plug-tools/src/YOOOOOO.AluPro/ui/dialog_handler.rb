# Copyright 2016-2022 Trimble Inc
# Licensed under the MIT license

require "sketchup.rb"
require_relative "callbacks"

module YOOOOOO
  module AluPro
    module UI
      module DialogHandler
        extend self

        def current_dialog
          @dialog
        end

        def show_dialog
          # 如果对话框已存在且可见，则将其前置并返回
          if @dialog && @dialog.visible?
            @dialog.bring_to_front
            return
          end

          # 定义对话框标题
          dialog_title = "YOOOOO AluPro"

          # 获取HTML文件的绝对路径
          html_file_path = File.join(YOOOOOO::AluPro::PROJECT_ROOT, "ui", "index.html")

          # 核心：根据SketchUp版本选择不同控件
          if Sketchup.version.to_f < 17.0
            # --- 旧版本：使用 WebDialog (SketchUp 2016 及更早) ---
            # 参数说明：标题, 可调整大小, 唯一ID, 宽, 高, 左, 上, 强制置顶
            @dialog = ::UI::WebDialog.new(dialog_title, false,
                                          dialog_title.gsub(/\s+/, "_"), 420, 640, 150, 150, true) # 最后一个参数 true 表示强制置顶
            @dialog.set_file(html_file_path) if File.exist?(html_file_path)
            @dialog.show
          else
            # --- 新版本：使用 HtmlDialog (SketchUp 2017 及以后) ---
            # 这是官方推荐的更现代、集成更好的控件，默认行为就很好
            @dialog = ::UI::HtmlDialog.new({
              :dialog_title => dialog_title,  # 窗口标题
              :width => 420,                  # 宽度
              :height => 640,                 # 高度
              :style => ::UI::HtmlDialog::STYLE_DIALOG, # 关键：对话框样式（有关闭按钮，行为更像模态框）
              :preferences_key => "YOOOOOO_AluPro_v1", # 唯一键，用于记忆窗口位置和大小
              :resizable => true,             # 不可调整大小（与您原设置一致）
            })
            # 加载本地HTML文件
            @dialog.set_file(html_file_path) if File.exist?(html_file_path)
            @dialog.show
            @dialog.center # 让对话框在屏幕居中显示
          end

          # --- 注册回调（这部分对两种对话框通用）---
          # 注意：HtmlDialog 也支持 add_action_callback，用法与 WebDialog 相同
          Callbacks.register_all(@dialog)

          # 可选：添加一个关闭时的清理回调
          @dialog.set_on_closed {
            puts "对话框已关闭。"
            # 注意：这里不要将 @dialog 设为 nil，因为用户可能再次打开。
            # 保留 @dialog 对象可以避免重复创建，并允许 bring_to_front。
          }
        rescue => e
          ::UI.messagebox("打开对话框时出错: #{e.message}\n#{e.backtrace.join("\n")}")
        end
      end
    end
  end
end

# 6. 注册插件菜单项 (防止重复加载)
unless file_loaded?(__FILE__)
  menu = UI.menu("Plugins")
  # 添加菜单项，点击后打开图形对话框
  menu.add_item("AluPro") do
    # self.show_dialog
    YOOOOOO::AluPro::UI::DialogHandler.show_dialog
  end
  file_loaded(__FILE__)
end
