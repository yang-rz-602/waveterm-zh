// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import Logo from "@/app/asset/logo.svg";
import { EmojiButton } from "@/app/element/emojibutton";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { useState } from "react";
import { CurrentOnboardingVersion } from "./onboarding-common";
import { OnboardingFooter } from "./onboarding-features-footer";
import { TailDeployLogCommand } from "./onboarding-layout-term";

export const DurableSessionPage = ({
    onNext,
    onSkip,
    onPrev,
}: {
    onNext: () => void;
    onSkip: () => void;
    onPrev?: () => void;
}) => {
    const [fireClicked, setFireClicked] = useState(false);

    const handleFireClick = () => {
        setFireClicked(!fireClicked);
        if (!fireClicked) {
            RpcApi.RecordTEventCommand(TabRpcClient, {
                event: "onboarding:fire",
                props: {
                    "onboarding:feature": "durable",
                    "onboarding:version": CurrentOnboardingVersion,
                },
            });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-4 mb-6 w-full unselectable flex-shrink-0">
                <div>
                    <Logo />
                </div>
                <div className="text-[25px] font-normal text-foreground">持久 SSH 会话</div>
            </header>
            <div className="flex-1 flex flex-row gap-0 min-h-0">
                <div className="flex-1 flex flex-col items-center justify-center gap-8 pr-3 unselectable">
                    <div className="flex flex-col items-start gap-3 max-w-md">
                        <div className="flex h-[52px] ml-[-4px] pl-3 pr-3 items-center rounded-lg bg-hover text-[15px]">
                            <i className="fa-sharp fa-solid fa-shield text-sky-500" />
                            <span className="font-bold ml-2 text-primary">保护 SSH 会话</span>
                        </div>

                        <div className="flex flex-col items-start gap-4 text-secondary">
                            <p>合上电脑、切换网络或重启 Wave 后，远程会话仍可继续运行。</p>

                            <div className="flex items-start gap-3 w-full">
                                <i className="fa-sharp fa-solid fa-link text-accent text-lg mt-1 flex-shrink-0" />
                                <p>保留 Shell 状态、运行程序和终端历史记录</p>
                            </div>

                            <div className="flex items-start gap-3 w-full">
                                <i className="fa-sharp fa-solid fa-rotate text-accent text-lg mt-1 flex-shrink-0" />
                                <p>网络恢复后，会话将自动重新连接</p>
                            </div>

                            <div className="flex items-start gap-3 w-full">
                                <i className="fa-sharp fa-solid fa-box text-accent text-lg mt-1 flex-shrink-0" />
                                <p>重新连接后自动补齐缓存输出</p>
                            </div>

                            <p className="italic">
                                终端内置类似 tmux 的会话保持能力。点击盾牌图标即可为 SSH 会话启用持久化。
                            </p>

                            <EmojiButton emoji="🔥" isClicked={fireClicked} onClick={handleFireClick} />
                        </div>
                    </div>
                </div>
                <div className="w-[2px] bg-border flex-shrink-0"></div>
                <div className="flex items-center justify-center pl-6 flex-shrink-0 w-[500px]">
                    <TailDeployLogCommand />
                </div>
            </div>
            <OnboardingFooter currentStep={2} totalSteps={4} onNext={onNext} onPrev={onPrev} onSkip={onSkip} />
        </div>
    );
};
