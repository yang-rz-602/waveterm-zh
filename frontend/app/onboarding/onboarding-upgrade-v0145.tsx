// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

const UpgradeOnboardingModal_v0_14_5_Content = () => {
    return (
        <div className="flex flex-col items-start gap-6 w-full mb-4 unselectable">
            <div className="text-secondary leading-relaxed">
                <p className="mb-0">
                    Wave v0.14.5 新增进程查看器，改进多项使用体验，并修复了在设置组件中创建配置文件的问题。
                </p>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-list-tree"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">进程查看器</div>
                    <div className="text-secondary leading-5">
                        新增进程组件，可查看本机与远程主机上的进程、CPU 和内存使用情况，并按列排序。
                    </div>
                </div>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-wrench"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">其他更改</div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>下拉终端模式</strong> — 全局快捷键（
                                <code>app:globalhotkey</code>）现在可以切换 Wave 窗口的显示状态
                            </li>
                            <li>
                                <strong>将文件拖入终端</strong>
                                以粘贴经过转义的文件路径
                            </li>
                            <li>
                                新增 <code>app:showsplitbuttons</code> 设置可在区块标题栏显示拆分按钮
                            </li>
                            <li>在查看菜单中切换组件侧栏的显示状态</li>
                            <li>按 F2 重命名当前标签页</li>
                            <li>鼠标前进和后退键现可用于网页组件导航</li>
                            <li>
                                <strong>[修复]</strong> 修复了设置组件中创建和编辑新配置文件的问题
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

UpgradeOnboardingModal_v0_14_5_Content.displayName = "UpgradeOnboardingModal_v0_14_5_Content";

export { UpgradeOnboardingModal_v0_14_5_Content };
