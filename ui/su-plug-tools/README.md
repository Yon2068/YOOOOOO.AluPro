# 用于 SketchUp 扩展开发的 VSCode 项目

这是一个用于设置 SketchUp 扩展开发的 VSCode 项目的样板工程。

该配置的关键特性：

* 在 VSCode 中打开项目时，如果缺少扩展，会提示推荐的 VSCode 扩展集合。
* 已配置 Ruby 自动补全与代码提示。
* 自动补全支持 SketchUp Ruby API。
* 提供用于在 SketchUp 中调试 Ruby 源码的 VSCode 任务。
* 基于 RuboCop 与 RuboCop SketchUp 的内联静态分析。

![](https://github.com/SketchUp/sketchup-ruby-api-tutorials/wiki/images/VSCode/VSCodeSolargraphAutoComplete.png)

## 环境要求

* 在开发环境中安装独立的 Ruby。详情见 [rubocop-sketchup 手册](https://rubocop-sketchup.readthedocs.io/en/stable/installation/)。
* 安装 [Bundler gem](http://bundler.io/) 用于管理依赖。

## 快速开始

1. 将项目克隆到本地。
2. 在命令行安装所需的 gem 依赖：`bundle install`
3. 开始编码！

## 配置说明

你可能需要根据项目需要检查或调整以下配置文件：

### `.rubocop.yml`

配置 RuboCop 在分析项目时的规则。文件中包含注释说明预配置项。更多细节请参考 [rubocop-sketchup 手册](https://rubocop-sketchup.readthedocs.io/en/stable/)。

### `.solargraph.yml`

可更新 `require_paths`，指向你的 SketchUp 安装路径，以确保 Solargraph 能完整提供 SketchUp API 的自动补全。

### `.vscode/tasks.json`

为不同版本的 SketchUp 添加或移除任务启动器，参考已有任务配置的格式。

### `.editorconfig`

根据你的编码风格调整该配置文件。它是多数编辑器支持的 [通用配置文件](https://editorconfig.org/)。

## 使用指南

### 在 SketchUp 中调试

![](https://github.com/SketchUp/sketchup-ruby-api-tutorials/wiki/images/VSCode/VSCodeDebugging.gif)

**注意：** _请确保已安装所需的调试器 dll/dylib，详见 [调试器安装说明](https://github.com/SketchUp/sketchup-ruby-api-tutorials/wiki/VSCode-Debugger-Setup#preparing-sketchup)，以便在 SketchUp 中启用调试。_

同时你还需要确保 [从项目目录直接加载扩展](https://github.com/SketchUp/sketchup-ruby-api-tutorials#loading-directly-from-the-repository)。

教程库中提供了图示说明：<https://code.visualstudio.com/docs/editor/debugging>。

简要步骤如下：

1. 在编辑器左侧行号区域设置断点。
2. `View > Command Palette`（`Ctrl+Shift+P`）
3. 输入 `task`
4. 选择 `Tasks: Run Task`
5. 选择 `Launch SketchUp in Ruby debug mode`
6. 选择要启动的 SketchUp 版本（如 `2022`）
7. 等待 SketchUp 启动完成。
8. 打开 VSCode 的调试页签（`Ctrl+Shift+D`）
9. 在下拉框中选择 `Listen for rdebug-ide`
10. 点击 `Start Debugging` 按钮。

更多详情：<https://github.com/SketchUp/sketchup-ruby-api-tutorials/wiki/VSCode-Debugger-Setup>

## 延伸阅读

关于 VSCode 集成 rubocop-sketchup 的最新信息，请参考：

* https://rubocop-sketchup.readthedocs.io/en/stable/integration_with_other_tools/
* https://github.com/SketchUp/sketchup-ruby-api-tutorials/wiki

## 软连接
 * 将项目根目录/资源/!external.rb.bak修改为!external.rb并复制到~/Library/Application Support/SketchUp 2024/SketchUp/Plugins目录下
