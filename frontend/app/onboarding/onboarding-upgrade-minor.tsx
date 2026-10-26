// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import Logo from "@/app/asset/logo.svg";
import { Button } from "@/app/element/button";
import { FlexiModal } from "@/app/modals/modal";
import { CurrentOnboardingVersion, OnboardingGradientBg } from "@/app/onboarding/onboarding-common";
import { OnboardingFeatures } from "@/app/onboarding/onboarding-features";
import { ClientModel } from "@/app/store/client-model";
import { globalStore } from "@/app/store/global";
import { disableGlobalKeybindings, enableGlobalKeybindings, globalRefocus } from "@/app/store/keymodel";
import { modalsModel } from "@/app/store/modalmodel";
import * as WOS from "@/app/store/wos";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useRef, useState } from "react";
import { debounce } from "throttle-debounce";

type UpgradeMinorWelcomePageProps = {
    onStarClick: () => void;
    onAlreadyStarred: () => void;
    onMaybeLater: () => void;
};

const UpgradeMinorWelcomePage = ({ onStarClick, onAlreadyStarred, onMaybeLater }: UpgradeMinorWelcomePageProps) => {
    return (
        <div className="flex flex-col h-full">
            <header className="flex flex-col gap-2 border-b-0 p-0 mt-1 mb-4 w-full unselectable flex-shrink-0">
                <div className="flex justify-center">
                    <Logo />
                </div>
                <div className="text-center text-[25px] font-normal text-foreground">欢迎使用 Wave v0.14！</div>
            </header>
            <OverlayScrollbarsComponent
                className="flex-1 overflow-y-auto min-h-0"
                options={{ scrollbars: { autoHide: "never" } }}
            >
                <div className="flex flex-col items-center gap-3 w-full mb-2 unselectable">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-row gap-4 items-center">
                            <div className="flex h-[52px] px-3 items-center rounded-lg bg-hover text-accent text-[24px]">
                                <i className="fa fa-sparkles" />
                                <span className="font-bold ml-2 font-mono">Wave AI</span>
                            </div>
                            <div className="flex h-[52px] px-3 items-center rounded-lg bg-hover text-[18px]">
                                <i className="fa-sharp fa-solid fa-shield text-sky-500" />
                                <span className="font-bold ml-2 text-accent">持久 SSH 会话</span>
                            </div>
                        </div>
                        <div className="text-secondary leading-relaxed max-w-[600px] text-left">
                            <p className="mb-4">
                                Wave AI 是具备完整上下文的终端助手，可读取终端输出、分析组件、读写文件，帮助你更快解决问题。
                            </p>
                            <p className="mb-4">
                                <span className="font-semibold text-foreground">v0.13 新功能：</span> Wave AI 现已支持本地模型和自备密钥，可接入 Ollama、LM Studio、vLLM、OpenRouter 及兼容 OpenAI 接口的服务。
                            </p>
                            <p className="mb-4">
                                <span className="font-semibold text-foreground">v0.14 新功能：</span> 持久 SSH 会话可在网络中断、电脑休眠和重启后恢复，持久化由 Wave 内置功能提供。
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-[550px] border-t border-border my-2"></div>

                    <div className="flex flex-col items-center gap-3 text-center max-w-[550px]">
                        <div className="text-foreground text-base">感谢你成为 Wave 的早期用户！⭐</div>
                        <div className="text-secondary text-sm text-left">
                            在 GitHub 点赞可以支持 Wave 和开源项目，帮助更多开发者发现它。
                        </div>
                    </div>
                </div>
            </OverlayScrollbarsComponent>
            <footer className="unselectable flex-shrink-0 mt-4">
                <div className="flex flex-row items-center justify-center gap-2.5 [&>button]:!px-5 [&>button]:!py-2 [&>button]:text-sm [&>button]:!h-[37px]">
                    <Button className="outlined grey font-[600]" onClick={onAlreadyStarred}>
                        🙏 已经点过赞
                    </Button>
                    <Button className="outlined green font-[600]" onClick={onStarClick}>
                        ⭐ 前往点赞
                    </Button>
                    <Button className="outlined grey font-[600]" onClick={onMaybeLater}>
                        稍后再说
                    </Button>
                </div>
            </footer>
        </div>
    );
};

UpgradeMinorWelcomePage.displayName = "UpgradeMinorWelcomePage";

const UpgradeOnboardingMinor = () => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [pageName, setPageName] = useState<"welcome" | "features">("welcome");
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

    const handleStarClick = async () => {
        RpcApi.RecordTEventCommand(
            TabRpcClient,
            {
                event: "onboarding:githubstar",
                props: { "onboarding:githubstar": "star", "onboarding:page": "minorupgrade" },
            },
            { noresponse: true }
        );
        const clientId = ClientModel.getInstance().clientId;
        await RpcApi.SetMetaCommand(TabRpcClient, {
            oref: WOS.makeORef("client", clientId),
            meta: { "onboarding:githubstar": true },
        });
        window.open("https://github.com/wavetermdev/waveterm?ref=upgrade", "_blank");
        setPageName("features");
    };

    const handleAlreadyStarred = async () => {
        RpcApi.RecordTEventCommand(
            TabRpcClient,
            {
                event: "onboarding:githubstar",
                props: { "onboarding:githubstar": "already", "onboarding:page": "minorupgrade" },
            },
            { noresponse: true }
        );
        const clientId = ClientModel.getInstance().clientId;
        await RpcApi.SetMetaCommand(TabRpcClient, {
            oref: WOS.makeORef("client", clientId),
            meta: { "onboarding:githubstar": true },
        });
        setPageName("features");
    };

    const handleMaybeLater = async () => {
        RpcApi.RecordTEventCommand(
            TabRpcClient,
            {
                event: "onboarding:githubstar",
                props: { "onboarding:githubstar": "later", "onboarding:page": "minorupgrade" },
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

    const handleFeaturesComplete = () => {
        const clientId = ClientModel.getInstance().clientId;
        RpcApi.SetMetaCommand(TabRpcClient, {
            oref: WOS.makeORef("client", clientId),
            meta: { "onboarding:lastversion": CurrentOnboardingVersion },
        });
        globalStore.set(modalsModel.upgradeOnboardingOpen, false);
        setTimeout(() => {
            globalRefocus();
        }, 10);
    };

    let pageComp: React.JSX.Element = null;
    if (pageName === "welcome") {
        pageComp = (
            <UpgradeMinorWelcomePage
                onStarClick={handleStarClick}
                onAlreadyStarred={handleAlreadyStarred}
                onMaybeLater={handleMaybeLater}
            />
        );
    } else if (pageName === "features") {
        pageComp = <OnboardingFeatures onComplete={handleFeaturesComplete} />;
    }

    if (pageComp == null) {
        return null;
    }

    const paddingClass = isCompact ? "!py-3 !px-[30px]" : "!p-[30px]";
    const widthClass = pageName === "features" ? "w-[800px]" : "w-[600px]";

    return (
        <FlexiModal className={`${widthClass} rounded-[10px] ${paddingClass} relative overflow-hidden`} ref={modalRef}>
            <OnboardingGradientBg />
            <div className="flex flex-col w-full h-full relative z-10">{pageComp}</div>
        </FlexiModal>
    );
};

UpgradeOnboardingMinor.displayName = "UpgradeOnboardingMinor";

export { UpgradeMinorWelcomePage, UpgradeOnboardingMinor };
