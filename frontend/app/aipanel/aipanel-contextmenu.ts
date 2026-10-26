// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { waveAIHasSelection } from "@/app/aipanel/waveai-focus-utils";
import { ContextMenuModel } from "@/app/store/contextmenu";
import { isDev } from "@/app/store/global";
import { globalStore } from "@/app/store/jotaiStore";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { WaveAIModel } from "./waveai-model";

export async function handleWaveAIContextMenu(e: React.MouseEvent, showCopy: boolean): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    const model = WaveAIModel.getInstance();
    const menu: ContextMenuItem[] = [];

    if (showCopy) {
        const hasSelection = waveAIHasSelection();
        if (hasSelection) {
            menu.push({
                role: "copy",
            });
            menu.push({ type: "separator" });
        }
    }

    menu.push({
        label: "新建对话",
        click: () => {
            model.clearChat();
        },
    });

    menu.push({ type: "separator" });

    const rtInfo = await RpcApi.GetRTInfoCommand(TabRpcClient, {
        oref: model.orefContext,
    });

    const defaultTokens = model.inBuilder ? 24576 : 4096;
    const currentMaxTokens = rtInfo?.["waveai:maxoutputtokens"] ?? defaultTokens;

    const maxTokensSubmenu: ContextMenuItem[] = [];

    if (model.inBuilder) {
        maxTokensSubmenu.push(
            {
                label: "24k",
                type: "checkbox",
                checked: currentMaxTokens === 24576,
                click: () => {
                    RpcApi.SetRTInfoCommand(TabRpcClient, {
                        oref: model.orefContext,
                        data: { "waveai:maxoutputtokens": 24576 },
                    });
                },
            },
            {
                label: "64k（专业版）",
                type: "checkbox",
                checked: currentMaxTokens === 65536,
                click: () => {
                    RpcApi.SetRTInfoCommand(TabRpcClient, {
                        oref: model.orefContext,
                        data: { "waveai:maxoutputtokens": 65536 },
                    });
                },
            }
        );
    } else {
        if (isDev()) {
            maxTokensSubmenu.push({
                label: "1k（开发测试）",
                type: "checkbox",
                checked: currentMaxTokens === 1024,
                click: () => {
                    RpcApi.SetRTInfoCommand(TabRpcClient, {
                        oref: model.orefContext,
                        data: { "waveai:maxoutputtokens": 1024 },
                    });
                },
            });
        }
        maxTokensSubmenu.push(
            {
                label: "4k",
                type: "checkbox",
                checked: currentMaxTokens === 4096,
                click: () => {
                    RpcApi.SetRTInfoCommand(TabRpcClient, {
                        oref: model.orefContext,
                        data: { "waveai:maxoutputtokens": 4096 },
                    });
                },
            },
            {
                label: "16k（专业版）",
                type: "checkbox",
                checked: currentMaxTokens === 16384,
                click: () => {
                    RpcApi.SetRTInfoCommand(TabRpcClient, {
                        oref: model.orefContext,
                        data: { "waveai:maxoutputtokens": 16384 },
                    });
                },
            },
            {
                label: "64k（专业版）",
                type: "checkbox",
                checked: currentMaxTokens === 65536,
                click: () => {
                    RpcApi.SetRTInfoCommand(TabRpcClient, {
                        oref: model.orefContext,
                        data: { "waveai:maxoutputtokens": 65536 },
                    });
                },
            }
        );
    }

    menu.push({
        label: "最大输出 Token 数",
        submenu: maxTokensSubmenu,
    });

    menu.push({ type: "separator" });

    menu.push({
        label: "配置模式",
        click: () => {
            RpcApi.RecordTEventCommand(
                TabRpcClient,
                {
                    event: "action:other",
                    props: {
                        "action:type": "waveai:configuremodes:contextmenu",
                    },
                },
                { noresponse: true }
            );
            model.openWaveAIConfig();
        },
    });

    if (model.canCloseWaveAIPanel()) {
        menu.push({ type: "separator" });

        menu.push({
            label: "隐藏 Wave AI",
            click: () => {
                model.closeWaveAIPanel();
            },
        });
    }

    ContextMenuModel.getInstance().showContextMenu(menu, e);
}
