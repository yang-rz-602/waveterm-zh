// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import Logo from "@/app/asset/logo.svg";
import { Button } from "@/app/element/button";
import { FlexiModal } from "@/app/modals/modal";
import { OnboardingGradientBg } from "@/app/onboarding/onboarding-common";
import { OnboardingFeatures } from "@/app/onboarding/onboarding-features";
import { ClientModel } from "@/app/store/client-model";
import { useSettingsKeyAtom } from "@/app/store/global";
import { disableGlobalKeybindings, enableGlobalKeybindings, globalRefocus } from "@/app/store/keymodel";
import { modalsModel } from "@/app/store/modalmodel";
import * as WOS from "@/app/store/wos";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { WorkspaceLayoutModel } from "@/app/workspace/workspace-layout-model";
import * as services from "@/store/services";
import { fireAndForget } from "@/util/util";
import { atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useRef, useState } from "react";
import { debounce } from "throttle-debounce";

// Page flow:
//   init -> (telemetry enabled) -> features
//   init -> (telemetry disabled) -> notelemetrystar -> features

type PageName = "init" | "notelemetrystar" | "features";

const pageNameAtom: PrimitiveAtom<PageName> = atom<PageName>("init");

const InitPage = ({
    isCompact,
    telemetryUpdateFn,
}: {
    isCompact: boolean;
    telemetryUpdateFn: (value: boolean) => Promise<void>;
}) => {
    const telemetrySetting = useSettingsKeyAtom("telemetry:enabled");
    const clientData = useAtomValue(ClientModel.getInstance().clientAtom);
    const [telemetryEnabled, setTelemetryEnabled] = useState<boolean>(!!telemetrySetting);
    const setPageName = useSetAtom(pageNameAtom);

    const handleStarClick = async () => {
        RpcApi.RecordTEventCommand(
            TabRpcClient,
            {
                event: "onboarding:githubstar",
                props: { "onboarding:githubstar": "star", "onboarding:page": "init" },
            },
            { noresponse: true }
        );
        const clientId = ClientModel.getInstance().clientId;
        await RpcApi.SetMetaCommand(TabRpcClient, {
            oref: WOS.makeORef("client", clientId),
            meta: { "onboarding:githubstar": true },
        });
    };

    const acceptTos = () => {
        if (!clientData?.tosagreed) {
            fireAndForget(() => services.ClientService.AgreeTos());
        }
        if (telemetryEnabled) {
            WorkspaceLayoutModel.getInstance().setAIPanelVisible(true);
        }
        setPageName(telemetryEnabled ? "features" : "notelemetrystar");
    };

    const setTelemetry = (value: boolean) => {
        fireAndForget(() =>
            telemetryUpdateFn(value).then(() => {
                setTelemetryEnabled(value);
            })
        );
    };

    const label = telemetryEnabled ? "已启用" : "已关闭";

    return (
        <div className="flex flex-col h-full">
            <header
                className={`flex flex-col gap-2 border-b-0 p-0 ${isCompact ? "mt-1 mb-4" : "mb-9"} w-full unselectable flex-shrink-0`}
            >
                <div className={`${isCompact ? "" : "mb-2.5"} flex justify-center`}>
                    <Logo />
                </div>
                <div className="text-center text-[25px] font-normal text-foreground">欢迎使用 Wave Terminal</div>
            </header>
            <OverlayScrollbarsComponent
                className="flex-1 overflow-y-auto min-h-0"
                options={{ scrollbars: { autoHide: "never" } }}
            >
                <div className="flex flex-col items-start gap-8 w-full mb-5 unselectable">
                    <div className="flex w-full items-center gap-[18px]">
                        <div>
                            <a
                                target="_blank"
                                href="https://github.com/wavetermdev/waveterm?ref=install"
                                rel="noopener"
                                className="text-accent"
                                onClick={handleStarClick}
                            >
                                <i className="text-[32px] text-white/50 fa-brands fa-github"></i>
                            </a>
                        </div>
                        <div className="flex flex-col items-start gap-1 flex-1">
                            <div className="text-foreground text-base leading-[18px]">在 GitHub 支持项目</div>
                            <div className="text-secondary leading-5">
                                我们坚持 <i>开源</i>, <i>开放模型接入</i>，并致力于为个人用户提供免费终端。欢迎为我们点赞支持，访问{" "}
                                <a
                                    target="_blank"
                                    href="https://github.com/wavetermdev/waveterm?ref=install"
                                    rel="noopener"
                                    className="text-accent"
                                    onClick={handleStarClick}
                                >
                                    GitHub（wavetermdev/waveterm）
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full items-center gap-[18px]">
                        <div>
                            <a
                                target="_blank"
                                href="https://discord.gg/XfvZ334gwU"
                                rel="noopener"
                                className="text-accent"
                            >
                                <i className="text-[25px] text-white/50 fa-solid fa-people-group"></i>
                            </a>
                        </div>
                        <div className="flex flex-col items-start gap-1 flex-1">
                            <div className="text-foreground text-base leading-[18px]">加入社区</div>
                            <div className="text-secondary leading-5">
                                获取帮助、提交功能建议、报告问题，或与终端爱好者交流。
                                <br />
                                <a
                                    target="_blank"
                                    href="https://discord.gg/XfvZ334gwU"
                                    rel="noopener"
                                    className="text-accent"
                                >
                                    加入 Wave Discord 频道
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full items-center gap-[18px]">
                        <div>
                            <i className="text-[32px] text-white/50 fa-solid fa-chart-line"></i>
                        </div>
                        <div className="flex flex-col items-start gap-1 flex-1">
                            <div className="text-secondary leading-5">
                                匿名使用情况数据有助于改进常用功能。
                                <br />
                                <a
                                    className="text-secondary! hover:underline!"
                                    target="_blank"
                                    href="https://waveterm.dev/privacy"
                                    rel="noopener"
                                >
                                    隐私政策
                                </a>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer text-secondary">
                                <input
                                    type="checkbox"
                                    checked={telemetryEnabled}
                                    onChange={(e) => setTelemetry(e.target.checked)}
                                    className="cursor-pointer accent-gray-500"
                                />
                                <span>{label}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </OverlayScrollbarsComponent>
            <footer className={`unselectable flex-shrink-0 ${isCompact ? "mt-2" : "mt-5"}`}>
                <div className="flex flex-row items-center justify-center [&>button]:!px-5 [&>button]:!py-2 [&>button]:text-sm [&>button:not(:first-child)]:ml-2.5">
                    <Button className="font-[600]" onClick={acceptTos}>
                        继续
                    </Button>
                </div>
            </footer>
        </div>
    );
};

const NoTelemetryStarPage = ({ isCompact }: { isCompact: boolean }) => {
    const setPageName = useSetAtom(pageNameAtom);

    const handleStarClick = async () => {
        RpcApi.RecordTEventCommand(
            TabRpcClient,
            {
                event: "onboarding:githubstar",
                props: { "onboarding:githubstar": "star", "onboarding:page": "notelemetry" },
            },
            { noresponse: true }
        );
        const clientId = ClientModel.getInstance().clientId;
        await RpcApi.SetMetaCommand(TabRpcClient, {
            oref: WOS.makeORef("client", clientId),
            meta: { "onboarding:githubstar": true },
        });
        window.open("https://github.com/wavetermdev/waveterm?ref=not", "_blank");
        setPageName("features");
    };

    const handleMaybeLater = async () => {
        RpcApi.RecordTEventCommand(
            TabRpcClient,
            {
                event: "onboarding:githubstar",
                props: { "onboarding:githubstar": "later", "onboarding:page": "notelemetry" },
            },
            { noresponse: true }
        );
        const clientId = ClientModel.getInstance().clientId;
        await RpcApi.SetMetaCommand(TabRpcClient, {
            oref: WOS.makeORef("client", clientId),
            meta: { "onboarding:githubstar": false },
        });
        setPageName("features");
    };

    return (
        <div className="flex flex-col h-full">
            <header className={`flex flex-col gap-2 border-b-0 p-0 mt-1 mb-4 w-full unselectable flex-shrink-0`}>
                <div className={`flex justify-center`}>
                    <Logo />
                </div>
                <div className="text-center text-[25px] font-normal text-foreground">使用情况统计已关闭 ✓</div>
            </header>
            <OverlayScrollbarsComponent
                className="flex-1 overflow-y-auto min-h-0"
                options={{ scrollbars: { autoHide: "never" } }}
            >
                <div className="flex flex-col items-center gap-6 w-full mb-2 unselectable">
                    <div className="text-center text-secondary leading-relaxed max-w-md">
                        <p className="mb-4">已保留你的隐私偏好。</p>
                        <p className="mb-4">
                            欢迎通过 GitHub 点赞支持 Wave，这有助于我们了解项目的使用价值并持续维护。
                        </p>
                    </div>
                </div>
            </OverlayScrollbarsComponent>
            <footer className={`unselectable flex-shrink-0 mt-2`}>
                <div className="flex flex-row items-center justify-center gap-2.5 [&>button]:!px-5 [&>button]:!py-2 [&>button]:text-sm [&>button]:!h-[37px]">
                    <Button className="outlined green font-[600]" onClick={handleStarClick}>
                        ⭐ 在 GitHub 点赞
                    </Button>
                    <Button className="outlined grey font-[600]" onClick={handleMaybeLater}>
                        稍后再说
                    </Button>
                </div>
            </footer>
        </div>
    );
};

const FeaturesPage = () => {
    const [newInstallOnboardingOpen, setNewInstallOnboardingOpen] = useAtom(modalsModel.newInstallOnboardingOpen);

    const handleComplete = () => {
        setNewInstallOnboardingOpen(false);
        setTimeout(() => {
            globalRefocus();
        }, 10);
    };

    return <OnboardingFeatures onComplete={handleComplete} />;
};

const NewInstallOnboardingModal = () => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [pageName, setPageName] = useAtom(pageNameAtom);
    const clientData = useAtomValue(ClientModel.getInstance().clientAtom);
    const [isCompact, setIsCompact] = useState<boolean>(window.innerHeight < 800);

    const updateModalHeight = () => {
        const windowHeight = window.innerHeight;
        setIsCompact(windowHeight < 800);
        if (modalRef.current) {
            const modalHeight = modalRef.current.offsetHeight;
            const maxHeight = windowHeight * 0.9;
            if (maxHeight < modalHeight) {
                modalRef.current.style.height = `${maxHeight}px`;
            } else {
                modalRef.current.style.height = "auto";
            }
        }
    };

    useEffect(() => {
        if (clientData.tosagreed) {
            setPageName("features");
        }
        return () => {
            setPageName("init");
        };
    }, []);

    useEffect(() => {
        updateModalHeight();
        const debouncedUpdateModalHeight = debounce(150, updateModalHeight);
        window.addEventListener("resize", debouncedUpdateModalHeight);
        return () => {
            window.removeEventListener("resize", debouncedUpdateModalHeight);
        };
    }, []);

    useEffect(() => {
        disableGlobalKeybindings();
        return () => {
            enableGlobalKeybindings();
        };
    }, []);

    let pageComp: React.JSX.Element = null;
    switch (pageName) {
        case "init":
            pageComp = <InitPage isCompact={isCompact} telemetryUpdateFn={(value) => services.ClientService.TelemetryUpdate(value)} />;
            break;
        case "notelemetrystar":
            pageComp = <NoTelemetryStarPage isCompact={isCompact} />;
            break;
        case "features":
            pageComp = <FeaturesPage />;
            break;
    }
    if (pageComp == null) {
        return null;
    }

    const paddingClass = isCompact ? "!py-3 !px-[30px]" : "!p-[30px]";
    const widthClass = pageName === "features" ? "w-[800px]" : "w-[560px]";

    return (
        <FlexiModal className={`${widthClass} rounded-[10px] ${paddingClass} relative overflow-hidden`} ref={modalRef}>
            <OnboardingGradientBg />
            <div className="flex flex-col w-full h-full relative z-10">{pageComp}</div>
        </FlexiModal>
    );
};

NewInstallOnboardingModal.displayName = "NewInstallOnboardingModal";

export { InitPage, NewInstallOnboardingModal, NoTelemetryStarPage };
