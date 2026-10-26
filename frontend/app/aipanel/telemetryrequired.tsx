// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { cn } from "@/util/util";
import { useState } from "react";
import { WaveAIModel } from "./waveai-model";

interface TelemetryRequiredMessageProps {
    className?: string;
}

const TelemetryRequiredMessage = ({ className }: TelemetryRequiredMessageProps) => {
    const [isEnabling, setIsEnabling] = useState(false);

    const handleEnableTelemetry = async () => {
        setIsEnabling(true);
        try {
            await RpcApi.WaveAIEnableTelemetryCommand(TabRpcClient);
            setTimeout(() => {
                WaveAIModel.getInstance().focusInput();
            }, 100);
        } catch (error) {
            console.error("Failed to enable telemetry:", error);
            setIsEnabling(false);
        }
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <div className="flex-grow"></div>
            <div className="flex items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-6">
                    <div className="space-y-4">
                        <i className="fa fa-sparkles text-accent text-5xl"></i>
                        <h2 className="text-2xl font-semibold text-foreground">Wave AI</h2>
                        <p className="text-secondary leading-relaxed">
                            Wave AI 可免费使用，支持与组件交互、协助编程、分析文件，以及处理终端工作流。
                        </p>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <i className="fa fa-info-circle text-blue-400 text-lg mt-0.5"></i>
                            <div className="text-left">
                                <div className="text-blue-400 font-medium mb-1">使用情况统计支持 Wave AI 持续免费提供服务</div>
                                <div className="text-secondary text-sm mb-3">
                                    <p className="mb-2">
                                        为持续免费提供 Wave AI 服务，我们需要少量的 <i>匿名</i>{" "}
                                        使用情况数据（应用版本、功能使用情况、系统信息）。
                                    </p>
                                    <p className="mb-2">
                                        这有助于防止自动化滥用，保障真实用户使用服务。
                                    </p>
                                    <p className="mb-2">
                                        Wave 的使用情况统计排除文件、提示词、按键、主机名和个人身份信息。Wave AI 使用 OpenAI API，其数据处理方式请参阅 OpenAI 隐私政策。
                                    </p>
                                    <p>
                                        关于自备密钥和本地模型的支持，请参阅{" "}
                                        <a
                                            href="https://docs.waveterm.dev/waveai-modes"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="!text-secondary hover:!text-accent/80 cursor-pointer"
                                        >
                                            https://docs.waveterm.dev/waveai-modes
                                        </a>
                                        .
                                    </p>
                                </div>
                                <button
                                    onClick={handleEnableTelemetry}
                                    disabled={isEnabling}
                                    className="bg-accent/80 hover:bg-accent disabled:bg-accent/50 text-background px-4 py-2 rounded-lg font-medium cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isEnabling ? "Enabling..." : "启用使用情况统计并继续"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-secondary">
                        <a
                            href="https://waveterm.dev/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="!text-secondary hover:!text-accent/80 cursor-pointer"
                        >
                            隐私政策
                        </a>
                    </div>
                </div>
            </div>
            <div className="flex-grow-[2]"></div>
        </div>
    );
};

TelemetryRequiredMessage.displayName = "TelemetryRequiredMessage";

export { TelemetryRequiredMessage };
