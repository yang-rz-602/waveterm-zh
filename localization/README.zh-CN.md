# Wave Terminal 0.14.5 简体中文版

基于官方 `v0.14.5`，源码提交 `97e560027f494d20fed347b2d6b72b6bcb3e50e0`。
本地版本标识：`0.14.5-zh.1`，适用于 Windows x64。

## 使用

双击交付目录中的 `Wave-ZH.exe`，或桌面上的“Wave 简体中文版”快捷方式。
首次启动会从英文版复制连接配置、加密凭据和常用设置到汉化版的独立目录。
原版安装、原版配置和原版终端工作区继续保留。

默认路径：

- 汉化版配置：`%USERPROFILE%\.config\waveterm-zh`
- 汉化版运行数据：`%LOCALAPPDATA%\waveterm-zh\Data`
- 汉化版 Electron 配置：`%APPDATA%\Wave-ZH`
- 英文版配置：`%USERPROFILE%\.config\waveterm`

汉化版与英文版分别维护配置。首次复制完成后，各自的后续更改保存在对应目录。
凭据使用 Wave 原有的加密格式和当前 Windows 用户保护。发布包只包含程序文件，运行时复制的个人配置位于上述用户目录。
本地汉化版使用手动更新，保留英文版的更新配置。

## 汉化范围

- 原生菜单、快捷菜单、设置与凭据管理。
- SSH 连接列表、连接状态、持久会话提示。
- 标签页、工作区、组件启动器、文件浏览器、进程查看器。
- Wave AI 面板、工具批准、常用错误及当前版本的首次使用引导。
- 为中文界面添加微软雅黑字体回退，默认界面语言为 `zh-CN`。

翻译表收录 757 条条目；自动化记录覆盖 899 处源码文案，另有原生角色菜单及侧栏显示文字的定向汉化。
终端程序输出、用户文件内容、网址、配置键、模型标识和协议字段保留原文。历史版本更新说明、部分编辑器内置文案与底层错误仍可能显示英文。

## 构建与验证

React 界面、Electron 主进程和预加载脚本均从该版本源码重新编译。
Electron 运行时采用官方 41.1.0；`wavesrv`、各平台 `wsh`、配置 schema 与 Tsunami scaffold 采用已安装的官方 0.14.5 文件。
本次构建范围为界面汉化，Go 后端保持官方二进制及原始哈希。

在仓库根目录运行：

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund --workspaces=false
node node_modules/electron/install.js
powershell -NoProfile -File localization/prepare-native.ps1
node localization/verify-localization.mjs
node_modules\.bin\tsc.cmd --project tsconfig.zh.json --pretty false
npm.cmd run build:prod
node_modules\.bin\electron-builder.cmd --config electron-builder.zh.cjs --dir --win --x64 --publish never
node localization/smoke-test.mjs
```

`translate-source.mjs` 是翻译维护工具，正常增量构建直接使用已经汉化的源码。
`tsconfig.zh.json` 检查生产代码，排除上游预览示例和测试夹具。

验证脚本会在本机 `localization` 目录生成检查结果与截图。检查结果只记录数量和状态；本机连接名、凭据名称及截图不会作为发布内容。

SSH 登录与远程扩展安装沿用用户的网络条件及原有设置，本次集成测试验证连接条目和凭据读取。

上游源码与构建文档：https://github.com/wavetermdev/waveterm/tree/v0.14.5
上游许可证：Apache-2.0。发行目录同时保留 Electron 及第三方许可文件。
