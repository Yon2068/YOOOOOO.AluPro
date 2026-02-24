require "net/http"
require "json"
require "uri"
require "sketchup.rb"

module YOOOOOO
  module AluPro
    module Updater
      extend self

      # 阿里云OSS配置（请替换为实际地址）
      VERSION_URL = "https://yoooooo-alu-pro.oss-cn-hangzhou.aliyuncs.com/version.json"

      def check_for_update(current_version)
        uri = URI.parse(VERSION_URL)
        response = Net::HTTP.get_response(uri)

        if response.is_a?(Net::HTTPSuccess)
          data = JSON.parse(response.body)
          remote_version = Gem::Version.new(data["version"])
          local_version = Gem::Version.new(current_version)
          min_version = Gem::Version.new(data["min_version"] || "0.0.0")

          result = {
            has_update: remote_version > local_version,
            remote_version: data["version"],
            download_url: data["url"],
            desc: data["desc"],
            force_update: local_version < min_version,
          }
          return result
        else
          puts "Check update failed: #{response.code} #{response.message}"
          return nil
        end
      rescue => e
        puts "Check update error: #{e.message}"
        return nil
      end

      def download_file(url, target_path)
        uri = URI.parse(url)
        Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == "https") do |http|
          request = Net::HTTP::Get.new(uri)
          http.request(request) do |response|
            open(target_path, "wb") do |io|
              response.read_body do |chunk|
                io.write(chunk)
              end
            end
          end
        end
      end

      def perform_update(download_url)
        temp_dir = ENV["TMPDIR"] || ENV["TEMP"]
        target_path = File.join(temp_dir, "alu_pro_update.rbz")

        # 1. 下载
        begin
          download_file(download_url, target_path)
        rescue => e
          return { success: false, message: "Download failed: #{e.message}" }
        end

        begin
          Sketchup.install_from_archive(target_path, false)
          reload_extension(reopen: false)
          was_visible = @was_visible
          @was_visible = nil
          result = ::UI.messagebox("AluPro更新成功，点击确定重新打开插件", MB_OK)
          if result == IDOK && was_visible
            YOOOOOO::AluPro::UI::DialogHandler.show_dialog
          end
          return { success: true, message: "Update successful!" }
        rescue => e
          return { success: false, message: "Install failed: #{e.message}" }
        end
      end

      # 核心热重载逻辑
      def reload_extension(reopen: true)
        if defined?(YOOOOOO::AluPro::UI::DialogHandler)
          dialog = YOOOOOO::AluPro::UI::DialogHandler.current_dialog
          if dialog && dialog.visible?
            @was_visible = true
            dialog.close
          end
        end

        if defined?(YOOOOOO::AluPro.teardown_observers)
          YOOOOOO::AluPro.teardown_observers
        end

        project_root = YOOOOOO::AluPro::PROJECT_ROOT
        entry_file = File.expand_path("../YOOOOOO.AluPro.rb", project_root)

        if File.exist?(entry_file)
          [:EXT_VERSION, :EXT_TITLE, :EXT_NAME, :EXT_DESCRIPTION].each do |const_name|
            if YOOOOOO::AluPro.const_defined?(const_name)
              YOOOOOO::AluPro.send(:remove_const, const_name)
            end
          end
          load entry_file
        end

        $LOADED_FEATURES.reject! { |feature| feature.start_with?(project_root) }

        rb_files = Dir.glob(File.join(project_root, "**", "*.rb")).sort
        rb_files.reject! { |file| File.basename(file) == "main.rb" }
        rb_files.each { |file| load file }
        load File.join(project_root, "main.rb")

        if reopen && @was_visible
          YOOOOOO::AluPro::UI::DialogHandler.show_dialog
        end
      end
    end
  end
end
