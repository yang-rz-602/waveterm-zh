// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { MagnifyIcon } from "@/app/element/magnify";
import { PLATFORM, PlatformMacOS } from "@/util/platformutil";
import { cn } from "@/util/util";

const KeyCap = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="inline-block px-2 py-1 mx-[1px] font-mono text-[0.85em] text-foreground bg-highlightbg rounded-[3px] border border-gray-700 whitespace-nowrap">
            {children}
        </div>
    );
};

const IconBox = ({ children, variant = "accent" }: { children: React.ReactNode; variant?: "accent" | "secondary" }) => {
    const colorClasses =
        variant === "secondary"
            ? "text-secondary bg-white/5 border-white/10 [&_svg]:fill-secondary [&_svg_#arrow1]:fill-primary [&_svg_#arrow2]:fill-primary"
            : "text-accent-400 bg-accent-400/10 border-accent-400/20 [&_svg]:fill-accent-400 [&_svg_#arrow1]:fill-accent-400 [&_svg_#arrow2]:fill-accent-400";

    return (
        <div
            className={cn(
                "text-[20px] min-w-[32px] h-[32px] flex items-center justify-center rounded-md border [&_svg]:h-[16px]",
                colorClasses
            )}
        >
            {children}
        </div>
    );
};

const KeyBinding = ({ keyDecl }: { keyDecl: string }) => {
    const chordParts = keyDecl.split("+");
    const chordElems: React.ReactNode[] = [];

    for (let chordIdx = 0; chordIdx < chordParts.length; chordIdx++) {
        const parts = chordParts[chordIdx].trim().split(":");
        const elems: React.ReactNode[] = [];

        for (let part of parts) {
            if (part === "Cmd") {
                if (PLATFORM === PlatformMacOS) {
                    elems.push(<KeyCap key={`${chordIdx}-cmd`}>⌘ Cmd</KeyCap>);
                } else {
                    elems.push(<KeyCap key={`${chordIdx}-alt`}>Alt</KeyCap>);
                }
                continue;
            }
            if (part == "Ctrl") {
                elems.push(<KeyCap key={`${chordIdx}-ctrl`}>^ Ctrl</KeyCap>);
                continue;
            }
            if (part == "Shift") {
                elems.push(<KeyCap key={`${chordIdx}-shift`}>⇧ Shift</KeyCap>);
                continue;
            }
            if (part == "Arrows") {
                elems.push(<KeyCap key={`${chordIdx}-arrows1`}>←</KeyCap>);
                elems.push(<KeyCap key={`${chordIdx}-arrows2`}>→</KeyCap>);
                elems.push(<KeyCap key={`${chordIdx}-arrows3`}>↑</KeyCap>);
                elems.push(<KeyCap key={`${chordIdx}-arrows4`}>↓</KeyCap>);
                continue;
            }
            if (part == "Digit") {
                elems.push(<KeyCap key={`${chordIdx}-digit`}>数字（1–9）</KeyCap>);
                continue;
            }
            if (part == "[" || part == "]") {
                elems.push(<KeyCap key={`${chordIdx}-${part}`}>{part}</KeyCap>);
                continue;
            }
            elems.push(<KeyCap key={`${chordIdx}-${part}`}>{part.toUpperCase()}</KeyCap>);
        }

        chordElems.push(
            <div key={`chord-${chordIdx}`} className="flex flex-row items-center gap-1">
                {elems}
            </div>
        );

        if (chordIdx < chordParts.length - 1) {
            chordElems.push(
                <span key={`plus-${chordIdx}`} className="text-secondary mx-1">
                    +
                </span>
            );
        }
    }

    return <div className="flex flex-row items-center">{chordElems}</div>;
};

const QuickTips = () => {
    return (
        <div className="flex flex-col w-full gap-6 @container">
            <div className="flex flex-col gap-4 p-5 bg-gradient-to-br from-highlightbg/30 to-transparent hover:from-accent-400/5 rounded-lg border border-white/10 hover:border-accent-400/20 transition-all duration-300">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <div className="w-1 h-6 bg-accent-400 rounded-full"></div>
                    <span className="text-foreground">标题栏图标</span>
                </div>
                <div className="grid grid-cols-1 @lg:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <IconBox variant="secondary">
                            <MagnifyIcon enabled={false} />
                        </IconBox>
                        <div className="flex flex-col gap-0.5 flex-1">
                            <span className="text-[15px]">放大区块</span>
                            <KeyBinding keyDecl="Cmd:m" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-laptop fa-fw" />
                        </IconBox>
                        <div className="flex flex-col gap-0.5 flex-1">
                            <span className="text-[15px]">连接远程服务器</span>
                            <KeyBinding keyDecl="Cmd:g" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-cog fa-fw" />
                        </IconBox>
                        <span className="text-[15px]">区块设置</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-xmark-large fa-fw" />
                        </IconBox>
                        <div className="flex flex-col gap-0.5 flex-1">
                            <span className="text-[15px]">关闭区块</span>
                            <KeyBinding keyDecl="Cmd:w" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-gradient-to-br from-highlightbg/30 to-transparent hover:from-accent-400/5 rounded-lg border border-white/10 hover:border-accent-400/20 transition-all duration-300">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <div className="w-1 h-6 bg-accent-400 rounded-full"></div>
                    <span className="text-foreground">常用快捷键</span>
                </div>

                <div className="grid grid-cols-1 @lg:grid-cols-2 gap-x-5 gap-y-6">
                    <div className="flex flex-col gap-1.5">
                        <div className="text-sm text-accent-400 font-semibold uppercase tracking-wide mb-1">
                            主要快捷键
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">新建标签页</span>
                            <KeyBinding keyDecl="Cmd:t" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">新建终端区块</span>
                            <KeyBinding keyDecl="Cmd:n" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">打开 Wave AI 面板</span>
                            <KeyBinding keyDecl="Cmd:Shift:a" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="text-sm text-accent-400 font-semibold uppercase tracking-wide mb-1">
                            切换标签页（{PLATFORM === PlatformMacOS ? "Cmd" : "Alt"})
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">切换到指定标签页</span>
                            <KeyBinding keyDecl="Cmd:Digit" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">上一个标签页</span>
                            <KeyBinding keyDecl="Cmd:[" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">下一个标签页</span>
                            <KeyBinding keyDecl="Cmd:]" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="text-sm text-accent-400 font-semibold uppercase tracking-wide mb-1">
                            区块导航（Ctrl-Shift）
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">在区块间导航</span>
                            <KeyBinding keyDecl="Ctrl:Shift:Arrows" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">聚焦指定区块</span>
                            <KeyBinding keyDecl="Ctrl:Shift:Digit" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">聚焦 Wave AI</span>
                            <KeyBinding keyDecl="Ctrl:Shift:0" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="text-sm text-accent-400 font-semibold uppercase tracking-wide mb-1">
                            拆分区块
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">在右侧拆分</span>
                            <KeyBinding keyDecl="Cmd:d" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">在下方拆分</span>
                            <KeyBinding keyDecl="Cmd:Shift:d" />
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors">
                            <span className="text-[15px]">按方向拆分</span>
                            <KeyBinding keyDecl="Ctrl:Shift:s + Arrows" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-gradient-to-br from-highlightbg/30 to-transparent hover:from-accent-400/5 rounded-lg border border-white/10 hover:border-accent-400/20 transition-all duration-300">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <div className="w-1 h-6 bg-accent-400 rounded-full"></div>
                    <span className="text-foreground">wsh 命令</span>
                </div>
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 p-4 bg-black/20 rounded-lg border border-accent-400/30 hover:border-accent-400/50 transition-colors">
                        <code className="font-mono text-sm">
                            <span className="text-secondary">&gt; </span>
                            <span className="text-accent-400 font-semibold">wsh view</span>
                            <span className="text-muted"> [filename|url]</span>
                        </code>
                        <div className="text-secondary text-sm mt-1">预览文件、目录或网址</div>
                    </div>
                    <div className="flex flex-col gap-2 p-4 bg-black/20 rounded-lg border border-accent-400/30 hover:border-accent-400/50 transition-colors">
                        <code className="font-mono text-sm">
                            <span className="text-secondary">&gt; </span>
                            <span className="text-accent-400 font-semibold">wsh edit</span>
                            <span className="text-muted"> [filename]</span>
                        </code>
                        <div className="text-secondary text-sm mt-1">编辑配置和代码文件</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-gradient-to-br from-highlightbg/30 to-transparent hover:from-accent-400/5 rounded-lg border border-white/10 hover:border-accent-400/20 transition-all duration-300">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <div className="w-1 h-6 bg-accent-400 rounded-full"></div>
                    <span className="text-foreground">更多提示</span>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-computer-mouse fa-fw" />
                        </IconBox>
                        <span>
                            <b>标签页</b> - 右键点击标签页可更换背景或重命名。
                        </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-cog fa-fw" />
                        </IconBox>
                        <span>
                            <b>网页视图</b> - 点击网页视图中的齿轮，设置主页
                        </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-cog fa-fw" />
                        </IconBox>
                        <span>
                            <b>终端</b> - 点击终端中的齿轮，设置主题和字号
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-gradient-to-br from-highlightbg/30 to-transparent hover:from-accent-400/5 rounded-lg border border-white/10 hover:border-accent-400/20 transition-all duration-300">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <div className="w-1 h-6 bg-accent-400 rounded-full"></div>
                    <span className="text-foreground">需要更多帮助？</span>
                </div>
                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-md bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                        <IconBox variant="secondary">
                            <i className="fa-brands fa-discord fa-fw" />
                        </IconBox>
                        <a
                            target="_blank"
                            href="https://discord.gg/XfvZ334gwU"
                            rel="noopener"
                            className="hover:text-accent-400 hover:underline transition-colors font-medium"
                        >
                            加入 Discord 社区
                        </a>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-sliders fa-fw" />
                        </IconBox>
                        <a
                            target="_blank"
                            href="https://docs.waveterm.dev/config"
                            rel="noopener"
                            className="hover:text-accent-400 hover:underline transition-colors font-medium"
                        >
                            配置选项
                        </a>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-keyboard fa-fw" />
                        </IconBox>
                        <a
                            target="_blank"
                            href="https://docs.waveterm.dev/keybindings"
                            rel="noopener"
                            className="hover:text-accent-400 hover:underline transition-colors font-medium"
                        >
                            全部快捷键
                        </a>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                        <IconBox variant="secondary">
                            <i className="fa-solid fa-sharp fa-book fa-fw" />
                        </IconBox>
                        <a
                            target="_blank"
                            href="https://docs.waveterm.dev"
                            rel="noopener"
                            className="hover:text-accent-400 hover:underline transition-colors font-medium"
                        >
                            完整文档
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { KeyBinding, QuickTips };
