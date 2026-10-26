# Wave Terminal 简体中文版

基于 Wave Terminal `v0.14.5` 构建，版本 `0.14.5-zh.1`，适用于 Windows x64。汉化版程序、源码和使用说明均已发布。

## 下载

- [下载 Windows x64 压缩包](https://github.com/yang-rz-602/waveterm-zh/releases/download/v0.14.5-zh.1/Wave-ZH-0.14.5-zh.1-public-windows-x64.zip)
- [SHA-256 校验文件](https://github.com/yang-rz-602/waveterm-zh/releases/download/v0.14.5-zh.1/Wave-ZH-0.14.5-zh.1-public-windows-x64.zip.sha256)
- [全部版本与更新记录](https://github.com/yang-rz-602/waveterm-zh/releases)

下载并解压后，运行 `Wave-ZH.exe`。首次启动会将英文版的连接配置、加密凭据和常用设置复制到汉化版独立目录。发布包只含通用程序文件。

## 本地数据目录

- 汉化版配置：`%USERPROFILE%\.config\waveterm-zh`
- 汉化版运行数据：`%LOCALAPPDATA%\waveterm-zh\Data`
- 汉化版 Electron 配置：`%APPDATA%\Wave-ZH`
- 英文版配置来源：`%USERPROFILE%\.config\waveterm`

汉化版后续更改保存在自己的目录中。Wave 凭据继续使用当前 Windows 用户保护的加密格式。汉化版采用手动更新。

## 汉化范围

覆盖原生菜单、SSH 连接与状态、设置和凭据管理、标签页和工作区、文件浏览器、进程查看器、Wave AI 面板及首次使用引导。翻译表包含 757 条目，自动化转换覆盖 899 处源码文案。

终端程序输出、命令、网址、配置键、协议字段和用户文件内容保留原文；历史版本说明及部分内置编辑器文案仍可能显示英文。

## 构建与验证

React 界面、Electron 主进程和预加载脚本由本仓库源码构建。Electron 运行时为官方 41.1.0；Wave 原生 SSH/backend 组件沿用官方 0.14.5 版本。完整构建步骤见[汉化说明](localization/README.zh-CN.md)。

静态源码检查、应用启动、`zh-CN` 语言标识、加密凭据读取和连接菜单检查均已通过。SSH 登录需在具体网络和服务器环境中验证。

上游项目及原始英文说明保存在 [`README.upstream.md`](README.upstream.md)，上游代码采用 Apache-2.0 许可证。
