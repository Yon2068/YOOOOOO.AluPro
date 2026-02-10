module YOOOOOO
  module AluPro
    module WindowUtils
      def self.focus
        # 1. 优先使用官方 API (SketchUp 2021+)
        if Sketchup.respond_to?(:focus)
          Sketchup.focus
          return
        end

        # 2. 旧版本降级处理
        if Sketchup.platform == :platform_win
          focus_windows
        elsif Sketchup.platform == :platform_osx
          focus_osx
        end
      end

      # Windows 实现 (SketchUp 2017+)
      def self.focus_windows
        require "win32ole"
        begin
          # WScript.Shell 的 AppActivate 可以通过窗口标题模糊匹配激活窗口
          # SketchUp 窗口标题通常包含 "SketchUp"
          ws = WIN32OLE.new("WScript.Shell")
          ws.AppActivate("SketchUp")
        rescue => e
          puts "Windows Focus Error: #{e.message}"
        end
      end

      # macOS 实现
      def self.focus_osx
        # 使用 AppleScript 强制激活
        # 注意：这在某些高版本 macOS 上可能会首次弹窗请求“自动化”权限
        cmd = "osascript -e 'tell application \"SketchUp\" to activate'"
        system(cmd)
      end
    end
  end
end
