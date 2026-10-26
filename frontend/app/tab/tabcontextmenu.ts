// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { getOrefMetaKeyAtom, globalStore, recordTEvent } from "@/app/store/global";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { fireAndForget } from "@/util/util";
import { makeORef } from "../store/wos";
import type { TabEnv } from "./tab";

const FlagColors: { label: string; value: string }[] = [
    { label: "绿色", value: "#58C142" },
    { label: "青色", value: "#00FFDB" },
    { label: "蓝色", value: "#429DFF" },
    { label: "紫色", value: "#BF55EC" },
    { label: "红色", value: "#FF453A" },
    { label: "橙色", value: "#FF9500" },
    { label: "黄色", value: "#FFE900" },
];

export function buildTabBarContextMenu(env: TabEnv): ContextMenuItem[] {
    const currentTabBar = globalStore.get(env.getSettingsKeyAtom("app:tabbar")) ?? "top";
    const tabBarSubmenu: ContextMenuItem[] = [
        {
            label: "顶部",
            type: "checkbox",
            checked: currentTabBar === "top",
            click: () => fireAndForget(() => env.rpc.SetConfigCommand(TabRpcClient, { "app:tabbar": "top" })),
        },
        {
            label: "左侧",
            type: "checkbox",
            checked: currentTabBar === "left",
            click: () => fireAndForget(() => env.rpc.SetConfigCommand(TabRpcClient, { "app:tabbar": "left" })),
        },
    ];
    return [{ label: "标签栏位置", type: "submenu", submenu: tabBarSubmenu }];
}

export function buildTabContextMenu(
    id: string,
    renameRef: React.RefObject<(() => void) | null>,
    onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null) => void,
    env: TabEnv
): ContextMenuItem[] {
    const menu: ContextMenuItem[] = [];
    menu.push(
        { label: "重命名标签页", click: () => renameRef.current?.() },
        {
            label: "复制标签页 ID",
            click: () => fireAndForget(() => navigator.clipboard.writeText(id)),
        },
        { type: "separator" }
    );
    const tabORef = makeORef("tab", id);
    const currentFlagColor = globalStore.get(getOrefMetaKeyAtom(tabORef, "tab:flagcolor")) ?? null;
    const flagSubmenu: ContextMenuItem[] = [
        {
            label: "无",
            type: "checkbox",
            checked: currentFlagColor == null,
            click: () =>
                fireAndForget(() =>
                    env.rpc.SetMetaCommand(TabRpcClient, { oref: tabORef, meta: { "tab:flagcolor": null } })
                ),
        },
        ...FlagColors.map((fc) => ({
            label: fc.label,
            type: "checkbox" as const,
            checked: currentFlagColor === fc.value,
            click: () =>
                fireAndForget(() =>
                    env.rpc.SetMetaCommand(TabRpcClient, { oref: tabORef, meta: { "tab:flagcolor": fc.value } })
                ),
        })),
    ];
    menu.push({ label: "标记标签页", type: "submenu", submenu: flagSubmenu }, { type: "separator" });
    const fullConfig = globalStore.get(env.atoms.fullConfigAtom);
    const backgrounds = fullConfig?.backgrounds ?? {};
    const bgKeys = Object.keys(backgrounds).filter((k) => backgrounds[k] != null);
    bgKeys.sort((a, b) => {
        const aOrder = backgrounds[a]["display:order"] ?? 0;
        const bOrder = backgrounds[b]["display:order"] ?? 0;
        return aOrder - bOrder;
    });
    if (bgKeys.length > 0) {
        const submenu: ContextMenuItem[] = [];
        const oref = makeORef("tab", id);
        submenu.push({
            label: "默认",
            click: () =>
                fireAndForget(async () => {
                    await env.rpc.SetMetaCommand(TabRpcClient, {
                        oref,
                        meta: { "bg:*": true, "tab:background": null },
                    });
                    env.rpc.ActivityCommand(TabRpcClient, { settabtheme: 1 }, { noresponse: true });
                    recordTEvent("action:settabtheme");
                }),
        });
        for (const bgKey of bgKeys) {
            const bg = backgrounds[bgKey];
            submenu.push({
                label: bg["display:name"] ?? bgKey,
                click: () =>
                    fireAndForget(async () => {
                        await env.rpc.SetMetaCommand(TabRpcClient, {
                            oref,
                            meta: { "bg:*": true, "tab:background": bgKey },
                        });
                        env.rpc.ActivityCommand(TabRpcClient, { settabtheme: 1 }, { noresponse: true });
                        recordTEvent("action:settabtheme");
                    }),
            });
        }
        menu.push({ label: "背景", type: "submenu", submenu }, { type: "separator" });
    }
    menu.push(...buildTabBarContextMenu(env), { type: "separator" });
    menu.push({ label: "关闭标签页", click: () => onClose(null) });
    return menu;
}
