module YOOOOOO
  module AluPro
    # Reload extension by running this method from the Ruby Console:
    #   Example::HelloWorld.reload
    def self.reload
      original_verbose = $VERBOSE
      $VERBOSE = nil
      pattern = File.join(__dir__, "**/*.rb")
      puts "[Debug] 正在从以下模式重载文件: #{pattern}"
      count = Dir.glob(pattern).each { |file|
        # 跳过自己，避免循环加载
        next if File.realpath(file) == File.realpath(__FILE__)
        puts "  -> 加载: #{file}"
        load file
      }.size
      puts "[Debug] 共重载了 #{count} 个文件。"
      count
    ensure
      $VERBOSE = original_verbose
    end
  end # module HelloWorld
end # module Example
