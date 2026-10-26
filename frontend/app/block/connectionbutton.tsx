// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { computeConnColorNum } from "@/app/block/blockutil";
import { recordTEvent } from "@/app/store/global";
import { useWaveEnv } from "@/app/waveenv/waveenv";
import { IconButton } from "@/element/iconbutton";
import * as util from "@/util/util";
import * as jotai from "jotai";
import * as React from "react";
import DotsSvg from "../asset/dots-anim-4.svg";
import { BlockEnv } from "./blockenv";

interface ConnectionButtonProps {
    connection: string;
    changeConnModalAtom: jotai.PrimitiveAtom<boolean>;
    isTerminalBlock?: boolean;
}

export const ConnectionButton = React.memo(
    React.forwardRef<HTMLDivElement, ConnectionButtonProps>(
        ({ connection, changeConnModalAtom, isTerminalBlock }: ConnectionButtonProps, ref) => {
            const waveEnv = useWaveEnv<BlockEnv>();
            const [_connModalOpen, setConnModalOpen] = jotai.useAtom(changeConnModalAtom);
            const isLocal = util.isLocalConnName(connection);
            const connStatus = jotai.useAtomValue(waveEnv.getConnStatusAtom(connection));
            const localName = jotai.useAtomValue(waveEnv.getLocalHostDisplayNameAtom());
            let showDisconnectedSlash = false;
            let connIconElem: React.ReactNode = null;
            const connColorNum = computeConnColorNum(connStatus);
            let color = `var(--conn-icon-color-${connColorNum})`;
            const clickHandler = function () {
                recordTEvent("action:other", { "action:type": "conndropdown", "action:initiator": "mouse" });
                setConnModalOpen(true);
            };
            let titleText = null;
            let shouldSpin = false;
            let connDisplayName: string = null;
            let extraDisplayNameClassName = "";
            if (isLocal) {
                color = "var(--color-secondary)";
                if (connection === "local:gitbash") {
                    titleText = "已连接到 Git Bash";
                    connDisplayName = "Git Bash";
                } else {
                    titleText = "已连接到本机";
                    if (localName) {
                        titleText += ` (${localName})`;
                    }
                    if (isTerminalBlock) {
                        connDisplayName = localName;
                        extraDisplayNameClassName = "text-muted group-hover:text-secondary";
                    }
                }
                connIconElem = (
                    <i
                        className={util.cn(util.makeIconClass("laptop", false), "fa-stack-1x mr-[2px]")}
                        style={{ color: color }}
                    />
                );
            } else {
                titleText = "已连接到 " + connection;
                let iconName = "arrow-right-arrow-left";
                let iconSvg = null;
                if (connStatus?.status == "connecting") {
                    color = "var(--warning-color)";
                    titleText = "正在连接到 " + connection;
                    shouldSpin = false;
                    iconSvg = (
                        <div className="relative top-[5px] left-[9px] [&_svg]:fill-warning">
                            <DotsSvg />
                        </div>
                    );
                } else if (connStatus?.status == "error") {
                    color = "var(--error-color)";
                    titleText = "连接失败 " + connection;
                    if (connStatus?.error != null) {
                        titleText += " (" + connStatus.error + ")";
                    }
                    showDisconnectedSlash = true;
                } else if (!connStatus?.connected) {
                    color = "var(--grey-text-color)";
                    titleText = "已断开连接 " + connection;
                    showDisconnectedSlash = true;
                } else if (connStatus?.connhealthstatus === "degraded" || connStatus?.connhealthstatus === "stalled") {
                    color = "var(--warning-color)";
                    iconName = "signal-bars-slash";
                    if (connStatus.connhealthstatus === "degraded") {
                        titleText = "连接质量下降： " + connection;
                    } else {
                        titleText = "连接停滞： " + connection;
                    }
                }
                if (iconSvg != null) {
                    connIconElem = iconSvg;
                } else {
                    connIconElem = (
                        <i
                            className={util.cn(util.makeIconClass(iconName, false), "fa-stack-1x mr-[2px]")}
                            style={{ color: color }}
                        />
                    );
                }
            }

            const wshProblem = connection && !connStatus?.wshenabled && connStatus?.status == "connected";
            const showNoWshButton = wshProblem && !isLocal;

            return (
                <>
                    <div
                        ref={ref}
                        className="group flex items-center flex-nowrap overflow-hidden text-ellipsis min-w-0 font-normal text-primary rounded-sm hover:bg-highlightbg cursor-pointer"
                        onClick={clickHandler}
                        title={titleText}
                    >
                        <span
                            className={util.cn(
                                "fa-stack flex-[1_1_auto] overflow-hidden",
                                shouldSpin ? "fa-spin" : null
                            )}
                        >
                            {connIconElem}
                            <i
                                className={util.cn(
                                    "fa-slash fa-solid fa-stack-1x mr-[2px] [text-shadow:0_1px_black,0_1.5px_black]",
                                    showDisconnectedSlash ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: color }}
                            />
                        </span>
                        {connDisplayName ? (
                            <div
                                className={util.cn(
                                    "flex-[1_2_auto] overflow-hidden pr-1 ellipsis",
                                    extraDisplayNameClassName
                                )}
                            >
                                {connDisplayName}
                            </div>
                        ) : isLocal ? null : (
                            <div className="flex-[1_2_auto] overflow-hidden pr-1 ellipsis">{connection}</div>
                        )}
                    </div>
                    {showNoWshButton && (
                        <IconButton
                            decl={{
                                elemtype: "iconbutton",
                                icon: "link-slash",
                                title: "此连接尚未安装 wsh",
                            }}
                        />
                    )}
                </>
            );
        }
    )
);
ConnectionButton.displayName = "ConnectionButton";
