// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/app/element/button";
import { WorkspaceLayoutModel } from "@/app/workspace/workspace-layout-model";
import { atom } from "jotai";
import { useCallback } from "react";

export class WaveAiModel implements ViewModel {
    viewType = "waveai";
    viewIcon = atom("sparkles");
    viewName = atom("Wave AI");
    noPadding = atom(true);
    viewComponent = WaveAiDeprecatedView;

    constructor(_: ViewModelInitType) {}
}

function WaveAiDeprecatedView() {
    const handleOpenAIPanel = useCallback(() => {
        WorkspaceLayoutModel.getInstance().setAIPanelVisible(true);
    }, []);

    return (
        <div className="flex h-full w-full flex-col px-6 text-center">
            <div className="flex-[4]" />
            <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
                <h2 className="text-xl font-semibold text-primary">旧版 Wave AI 区块已停止维护</h2>
                <p className="mt-3 text-sm leading-6 text-secondary">
                    旧版 AI 组件已停用。请使用新版 Wave AI 面板进行对话、访问终端上下文、调用工具及上传文件。
                </p>
                <Button className="mt-6 cursor-pointer" onClick={handleOpenAIPanel}>
                    打开 Wave AI 面板
                </Button>
            </div>
            <div className="flex-[6]" />
        </div>
    );
}
