# module YOOOOOO
#   module AluPro
#     # 常量，用 freeze 防止意外修改，最安全
#     PROJECT_ROOT =  File.dirname(__FILE__).gsub(%r{//}) { "/" }.freeze
#     # # 或者使用类变量/方法，提供更大的灵活性
#     # @@default_size = 1.m

#     # def self.default_size
#     #   @@default_size
#     # end

#     # def self.default_size=(size)
#     #   @@default_size = size
#     # end
#   end
# end
