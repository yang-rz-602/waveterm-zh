// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { recordTEvent } from "@/app/store/global";
import { TermViewModel } from "@/app/view/term/term-model";
import { useWaveEnv } from "@/app/waveenv/waveenv";
import * as util from "@/util/util";
import { cn } from "@/util/util";
import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    safePolygon,
    shift,
    useFloating,
    useHover,
    useInteractions,
} from "@floating-ui/react";
import * as jotai from "jotai";
import { useEffect, useRef, useState } from "react";
import { BlockEnv } from "./blockenv";

function isTermViewModel(viewModel: ViewModel): viewModel is TermViewModel {
    return viewModel?.viewType === "term";
}

function LearnMoreButton() {
    const waveEnv = useWaveEnv<BlockEnv>();
    return (
        <button
            className="text-muted text-xs hover:underline cursor-pointer text-left"
            onClick={() => waveEnv.electron.openExternal("https://docs.waveterm.dev/durable-sessions")}
        >
            了解更多
        </button>
    );
}

interface StandardSessionContentProps {
    viewModel: TermViewModel;
    onClose: () => void;
}

function StandardSessionContent({ viewModel, onClose }: StandardSessionContentProps) {
    const handleRestartAsDurable = () => {
        recordTEvent("action:termdurable", { "action:type": "restartdurable" });
        onClose();
        util.fireAndForget(() => viewModel.restartSessionWithDurability(true));
    };

    return (
        <div className="flex flex-col gap-2 max-w-[280px]">
            <div className="font-semibold text-sm flex items-center gap-2 text-secondary">
                <i className="fa-sharp fa-regular fa-shield text-muted" />
                标准 SSH 会话
            </div>
            <div className="text-xs text-secondary leading-relaxed">
                标准 SSH 会话随连接中断而结束。持久会话会在网络变化、电脑休眠和 Wave 重启后保留 Shell 状态、运行程序和历史记录。
            </div>
            <button
                className="bg-zinc-700 text-foreground rounded px-3 py-1.5 text-xs font-medium hover:bg-zinc-600 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
                onClick={handleRestartAsDurable}
            >
                <i className="fa-solid fa-shield text-sky-500" />
                以持久模式重启
            </button>
            <LearnMoreButton />
        </div>
    );
}

interface DurableAttachedContentProps {
    onClose: () => void;
}

function DurableAttachedContent({ onClose }: DurableAttachedContentProps) {
    return (
        <div className="flex flex-col gap-2 max-w-[280px]">
            <div className="font-semibold text-sm flex items-center gap-2 text-secondary">
                <i className="fa-sharp fa-solid fa-shield text-sky-500" />
                持久会话（已连接）
            </div>
            <div className="text-xs text-secondary leading-relaxed">
                Shell 状态、运行中的程序和历史记录已受保护，网络断开后会话仍将保留。
            </div>
            <LearnMoreButton />
        </div>
    );
}

interface DurableDetachedContentProps {
    onClose: () => void;
}

function DurableDetachedContent({ onClose }: DurableDetachedContentProps) {
    return (
        <div className="flex flex-col gap-2 max-w-[280px]">
            <div className="font-semibold text-sm flex items-center gap-2 text-secondary">
                <i className="fa-sharp fa-solid fa-shield text-sky-300" />
                持久会话（已分离）
            </div>
            <div className="text-xs text-secondary leading-relaxed">
                连接已中断，远程服务器上的会话仍在运行。网络恢复后，Wave 将自动重新连接。
            </div>
            <LearnMoreButton />
        </div>
    );
}

interface DurableAwaitingStartProps {
    connected: boolean;
    viewModel: TermViewModel;
    onClose: () => void;
}

function DurableAwaitingStart({ connected, viewModel, onClose }: DurableAwaitingStartProps) {
    const handleStartSession = () => {
        onClose();
        util.fireAndForget(() => viewModel.forceRestartController());
    };

    if (!connected) {
        return (
            <div className="flex flex-col gap-2 max-w-[280px]">
                <div className="font-semibold text-sm flex items-center gap-2 text-secondary whitespace-nowrap">
                    <i className="fa-sharp fa-solid fa-shield text-muted" />
                    持久会话（等待连接）
                </div>
                <div className="text-xs text-secondary leading-relaxed">
                    已配置持久会话，连接建立后将自动启动。
                </div>
                <LearnMoreButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 max-w-[280px]">
            <div className="font-semibold text-sm flex items-center gap-2 text-secondary whitespace-nowrap">
                <i className="fa-sharp fa-solid fa-shield text-muted" />
                持久会话（等待启动）
            </div>
            <div className="text-xs text-secondary leading-relaxed">
                已配置持久会话，点击下方按钮手动启动。
            </div>
            <button
                className="bg-zinc-700 text-foreground rounded px-3 py-1.5 text-xs font-medium hover:bg-zinc-600 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
                onClick={handleStartSession}
            >
                <i className="fa-solid fa-shield text-sky-500" />
                启动会话
            </button>
            <LearnMoreButton />
        </div>
    );
}

interface DurableStartingContentProps {
    onClose: () => void;
}

function DurableStartingContent({ onClose }: DurableStartingContentProps) {
    return (
        <div className="flex flex-col gap-2 max-w-[280px]">
            <div className="font-semibold text-sm flex items-center gap-2 text-secondary">
                <i className="fa-sharp fa-solid fa-shield text-sky-300" />
                持久会话（正在启动）
            </div>
            <div className="text-xs text-secondary leading-relaxed">持久会话正在启动。</div>
            <LearnMoreButton />
        </div>
    );
}

interface DurableEndedContentProps {
    doneReason: string;
    startupError?: string;
    viewModel: TermViewModel;
    onClose: () => void;
}

function DurableEndedContent({ doneReason, startupError, viewModel, onClose }: DurableEndedContentProps) {
    const handleRestartSession = () => {
        onClose();
        util.fireAndForget(() => viewModel.forceRestartController());
    };

    const handleRestartAsStandard = () => {
        onClose();
        util.fireAndForget(() => viewModel.restartSessionWithDurability(false));
    };

    let titleText = "持久会话（已结束）";
    let descriptionText = "持久会话已结束，此区块保留持久会话配置。";
    const showRestartButton = true;

    if (doneReason === "terminated") {
        titleText = "持久会话（已退出）";
        descriptionText =
            "Shell 已终止，此区块保留持久会话配置。";
    } else if (doneReason === "gone") {
        titleText = "持久会话（已丢失）";
        descriptionText =
            "远程服务器上的会话已丢失，可能由系统重启或手动终止会话引起。";
    } else if (doneReason === "startuperror") {
        titleText = "持久会话（启动失败）";
        descriptionText = "持久会话启动失败。";
        return (
            <div className="flex flex-col gap-2 max-w-[280px]">
                <div className="font-semibold text-sm flex items-center gap-2 text-secondary">
                    <i className="fa-sharp fa-solid fa-shield text-muted" />
                    {titleText}
                </div>
                <div className="text-xs text-secondary leading-relaxed">{descriptionText}</div>
                {startupError && (
                    <div className="text-[11px] text-error leading-relaxed max-h-[3.5rem] overflow-y-auto">
                        {startupError}
                    </div>
                )}
                <button
                    className="bg-zinc-700 text-foreground rounded px-3 py-1.5 text-xs font-medium hover:bg-zinc-600 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
                    onClick={handleRestartSession}
                >
                    <i className="fa-solid fa-shield text-sky-500" />
                    重启会话
                </button>
                <button
                    className="bg-zinc-700 text-foreground rounded px-3 py-1.5 text-xs font-medium hover:bg-zinc-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    onClick={handleRestartAsStandard}
                >
                    <i className="fa-sharp fa-regular fa-shield text-muted" />
                    以标准模式重启
                </button>
                <LearnMoreButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 max-w-[280px]">
            <div className="font-semibold text-sm flex items-center gap-2 text-secondary">
                <i className="fa-sharp fa-solid fa-shield text-muted" />
                {titleText}
            </div>
            <div className="text-xs text-secondary leading-relaxed">{descriptionText}</div>
            {showRestartButton && (
                <button
                    className="bg-zinc-700 text-foreground rounded px-3 py-1.5 text-xs font-medium hover:bg-zinc-600 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
                    onClick={handleRestartSession}
                >
                    <i className="fa-solid fa-shield text-sky-500" />
                    重启会话
                </button>
            )}
            <LearnMoreButton />
        </div>
    );
}

function getContentToRender(
    viewModel: TermViewModel,
    onClose: () => void,
    jobStatus: BlockJobStatusData,
    connStatus: ConnStatus,
    isConfigedDurable?: boolean | null
): string | React.ReactNode {
    if (isConfigedDurable === false) {
        return <StandardSessionContent viewModel={viewModel} onClose={onClose} />;
    }

    const status = jobStatus?.status;
    if (status === "connected") {
        return <DurableAttachedContent onClose={onClose} />;
    } else if (status === "disconnected") {
        return <DurableDetachedContent onClose={onClose} />;
    } else if (status === "init") {
        return <DurableStartingContent onClose={onClose} />;
    } else if (status === "done") {
        const doneReason = jobStatus?.donereason;
        const startupError = jobStatus?.startuperror;
        return (
            <DurableEndedContent
                doneReason={doneReason}
                startupError={startupError}
                viewModel={viewModel}
                onClose={onClose}
            />
        );
    } else if (status == null) {
        return <DurableAwaitingStart connected={!!connStatus?.connected} viewModel={viewModel} onClose={onClose} />;
    }
    console.log("DurableSessionFlyover: unexpected jobStatus", jobStatus);
    return null;
}

function getIconProps(jobStatus: BlockJobStatusData, connStatus: ConnStatus, isConfigedDurable?: boolean | null) {
    let color = "text-muted";
    let iconType: "fa-solid" | "fa-regular" = "fa-solid";

    if (isConfigedDurable === false) {
        color = "text-muted";
        iconType = "fa-regular";
        return { color, iconType };
    }

    const status = jobStatus?.status;
    if (status === "connected") {
        color = "text-sky-500";
    } else if (status === "disconnected") {
        color = "text-sky-300";
    } else if (status === "init") {
        color = "text-sky-300";
    } else if (status === "done") {
        color = "text-muted";
    } else if (status == null) {
        color = "text-muted";
    }
    return { color, iconType };
}

interface DurableSessionFlyoverProps {
    blockId: string;
    viewModel: ViewModel;
    placement?: "top" | "bottom" | "left" | "right";
    divClassName?: string;
}

export function DurableSessionFlyover({
    blockId,
    viewModel,
    placement = "bottom",
    divClassName,
}: DurableSessionFlyoverProps) {
    const waveEnv = useWaveEnv<BlockEnv>();
    const connName = jotai.useAtomValue(waveEnv.getBlockMetaKeyAtom(blockId, "connection"));
    const termDurableStatus = util.useAtomValueSafe(viewModel?.termDurableStatus);
    const termConfigedDurable = util.useAtomValueSafe(viewModel?.termConfigedDurable);
    const connStatus = jotai.useAtomValue(waveEnv.getConnStatusAtom(connName));

    const { color: durableIconColor, iconType: durableIconType } = getIconProps(
        termDurableStatus,
        connStatus,
        termConfigedDurable
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const handleClose = () => {
        setIsVisible(false);
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: (open) => {
            if (open) {
                setIsOpen(true);
                if (timeoutRef.current !== null) {
                    window.clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = window.setTimeout(() => {
                    setIsVisible(true);
                }, 300);
            } else {
                setIsVisible(false);
                if (timeoutRef.current !== null) {
                    window.clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = window.setTimeout(() => {
                    setIsOpen(false);
                }, 300);
            }
        },
        placement,
        middleware: [offset(10), flip(), shift({ padding: 12 })],
        whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const hover = useHover(context, {
        handleClose: safePolygon(),
    });
    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    if (!isTermViewModel(viewModel)) {
        return null;
    }

    const content = getContentToRender(viewModel, handleClose, termDurableStatus, connStatus, termConfigedDurable);
    if (content == null) {
        return null;
    }

    return (
        <>
            <div ref={refs.setReference} {...getReferenceProps()} className={divClassName}>
                <i className={`fa-sharp ${durableIconType} fa-shield ${durableIconColor}`} />
            </div>
            {isOpen && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={{
                            ...floatingStyles,
                            opacity: isVisible ? 1 : 0,
                            transition: "opacity 200ms ease",
                        }}
                        {...getFloatingProps()}
                        className={cn(
                            "bg-zinc-800 border border-border rounded-md px-3 py-2.5 text-xs text-foreground shadow-xl z-50"
                        )}
                        onMouseDown={(e) => e.stopPropagation()}
                        onFocusCapture={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {content}
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}
