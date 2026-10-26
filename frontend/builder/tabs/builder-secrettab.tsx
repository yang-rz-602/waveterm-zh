// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { BuilderAppPanelModel } from "@/builder/store/builder-apppanel-model";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { atoms } from "@/store/global";
import { globalStore } from "@/app/store/jotaiStore";
import { useAtomValue } from "jotai";
import { memo, useState, useEffect } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { Tooltip } from "@/app/element/tooltip";
import { Modal } from "@/app/modals/modal";
import { modalsModel } from "@/app/store/modalmodel";

type SecretRowProps = {
    secretName: string;
    secretMeta: SecretMeta;
    currentBinding: string;
    availableSecrets: string[];
    onMapDefault: (secretName: string) => void;
    onSetAndMapDefault: (secretName: string) => void;
};

const SecretRow = memo(({ secretName, secretMeta, currentBinding, availableSecrets, onMapDefault, onSetAndMapDefault }: SecretRowProps) => {
    const isMapped = currentBinding.trim().length > 0;
    const isValid = isMapped && availableSecrets.includes(currentBinding);
    const isInvalid = isMapped && !isValid;
    const hasMatchingSecret = availableSecrets.includes(secretName);

    return (
        <div className="flex items-center gap-4 py-2 border-b border-border">
            <Tooltip content={!isMapped ? "Secret is Not Mapped" : isValid ? "Secret Has a Valid Mapping" : "Secret Binding is Invalid"}>
                <div className="flex items-center">
                    {!isMapped && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    {isInvalid && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {isValid && <Check className="w-5 h-5 text-green-500" />}
                </div>
            </Tooltip>
            <div className="flex-1 flex items-center gap-2">
                <span className="font-medium text-primary">{secretName}</span>
                {!secretMeta.optional && (
                    <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-500 rounded">必填</span>
                )}
                {secretMeta.optional && (
                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-500 rounded">可选</span>
                )}
                {secretMeta.desc && <span className="text-sm text-secondary">— {secretMeta.desc}</span>}
            </div>
            <div className="flex items-center gap-2">
                {!isMapped && hasMatchingSecret && (
                    <button
                        onClick={() => onMapDefault(secretName)}
                        className="px-3 py-1 text-sm font-medium rounded bg-accent/80 text-primary hover:bg-accent transition-colors cursor-pointer whitespace-nowrap"
                    >
                        映射默认值
                    </button>
                )}
                {!isMapped && !hasMatchingSecret && (
                    <button
                        onClick={() => onSetAndMapDefault(secretName)}
                        className="px-3 py-1 text-sm font-medium rounded bg-accent/80 text-primary hover:bg-accent transition-colors cursor-pointer whitespace-nowrap"
                    >
                        设置并映射默认值
                    </button>
                )}
            </div>
        </div>
    );
});

SecretRow.displayName = "SecretRow";

type SetSecretDialogProps = {
    secretName: string;
    onSetAndMap: (secretName: string, secretValue: string) => Promise<void>;
};

const SetSecretDialog = memo(({ secretName, onSetAndMap }: SetSecretDialogProps) => {
    const [secretValue, setSecretValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!secretValue.trim()) return;
        setIsSubmitting(true);
        setError("");
        try {
            await onSetAndMap(secretName, secretValue);
            modalsModel.popModal();
        } catch (err) {
            console.error("Failed to set secret:", err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        modalsModel.popModal();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (error) {
        return (
            <Modal className="p-4 min-w-[500px]" onOk={handleClose} onClose={handleClose} okLabel="OK">
                <div className="flex flex-col gap-4 mb-4">
                    <h2 className="text-xl font-semibold">凭据设置错误</h2>
                    <div className="text-sm text-error">{error}</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            className="p-4 min-w-[500px]"
            onOk={handleSubmit}
            onCancel={handleClose}
            onClose={handleClose}
            okLabel="Set and Map"
            cancelLabel={"取消"}
            okDisabled={!secretValue.trim() || isSubmitting}
        >
            <div className="flex flex-col gap-4 mb-4">
                <h2 className="text-xl font-semibold">设置并映射凭据</h2>
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium mb-1">
                        凭据名称： <span className="text-accent">{secretName}</span>
                    </div>
                    <textarea
                        value={secretValue}
                        onChange={(e) => setSecretValue(e.target.value)}
                        placeholder={"在此粘贴凭据内容…"}
                        className="w-full px-3 py-2 bg-panel border border-border rounded focus:outline-none focus:border-accent resize-none"
                        rows={4}
                        autoFocus
                        disabled={isSubmitting}
                    />
                    <div className="text-xs text-secondary">
                        凭据安全地保存在 Wave 凭据库中
                    </div>
                </div>
            </div>
        </Modal>
    );
});

SetSecretDialog.displayName = "SetSecretDialog";

const BuilderSecretTab = memo(() => {
    const model = BuilderAppPanelModel.getInstance();
    const builderStatus = useAtomValue(model.builderStatusAtom);
    const error = useAtomValue(model.errorAtom);

    const [availableSecrets, setAvailableSecrets] = useState<string[]>([]);

    const manifest = builderStatus?.manifest;
    const secrets = manifest?.secrets || {};
    const secretBindings = builderStatus?.secretbindings || {};

    useEffect(() => {
        const fetchSecrets = async () => {
            try {
                const secrets = await RpcApi.GetSecretsNamesCommand(TabRpcClient);
                setAvailableSecrets(secrets || []);
            } catch (err) {
                console.error("Failed to fetch secrets:", err);
            }
        };
        fetchSecrets();
    }, []);

    if (!builderStatus || !manifest) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-secondary text-center">
                    应用清单尚未生成，构建成功后将显示凭据配置。
                </div>
            </div>
        );
    }

    const sortedSecretEntries = Object.entries(secrets).sort(([nameA, metaA], [nameB, metaB]) => {
        if (!metaA.optional && metaB.optional) return -1;
        if (metaA.optional && !metaB.optional) return 1;
        return nameA.localeCompare(nameB);
    });

    const handleMapDefault = async (secretName: string) => {
        const newBindings = { ...secretBindings, [secretName]: secretName };
        
        try {
            const appId = globalStore.get(atoms.builderAppId);
            await RpcApi.WriteAppSecretBindingsCommand(TabRpcClient, {
                appid: appId,
                bindings: newBindings,
            });
            model.updateSecretBindings(newBindings);
            globalStore.set(model.errorAtom, "");
            model.restartBuilder();
        } catch (err) {
            console.error("Failed to save secret bindings:", err);
            globalStore.set(model.errorAtom, `Failed to save secret bindings: ${err.message || "Unknown error"}`);
        }
    };

    const handleSetAndMapDefault = (secretName: string) => {
        modalsModel.pushModal("SetSecretDialog", { secretName, onSetAndMap: handleSetAndMap });
    };

    const handleSetAndMap = async (secretName: string, secretValue: string) => {
        await RpcApi.SetSecretsCommand(TabRpcClient, { [secretName]: secretValue });
        setAvailableSecrets((prev) => [...prev, secretName]);
        
        const newBindings = { ...secretBindings, [secretName]: secretName };
        
        try {
            const appId = globalStore.get(atoms.builderAppId);
            await RpcApi.WriteAppSecretBindingsCommand(TabRpcClient, {
                appid: appId,
                bindings: newBindings,
            });
            model.updateSecretBindings(newBindings);
            globalStore.set(model.errorAtom, "");
            model.restartBuilder();
        } catch (err) {
            console.error("Failed to save secret bindings:", err);
            globalStore.set(model.errorAtom, `Failed to save secret bindings: ${err.message || "Unknown error"}`);
        }
    };

    const allRequiredBound =
        sortedSecretEntries.filter(([_, meta]) => !meta.optional).every(([name]) => secretBindings[name]?.trim()) ||
        false;

    return (
        <div className="w-full h-full flex flex-col p-4">
            <h2 className="text-lg font-semibold mb-2">凭据绑定</h2>

            <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-secondary">
                将应用凭据映射到 Wave 凭据库中的名称。运行应用前须绑定必填凭据，更改会自动保存。
            </div>

            {!allRequiredBound && (
                <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-600">
                    部分必填凭据仍待绑定。
                </div>
            )}

            {error && <div className="mb-4 p-2 bg-red-500/20 text-red-500 rounded text-sm">{error}</div>}

            <div className="flex-1 overflow-auto">
                {sortedSecretEntries.length === 0 ? (
                    <div className="text-secondary text-center py-8">
                        此应用清单尚未定义凭据。
                    </div>
                ) : (
                    <div className="space-y-1">
                        {sortedSecretEntries.map(([secretName, secretMeta]) => (
                            <SecretRow
                                key={secretName}
                                secretName={secretName}
                                secretMeta={secretMeta}
                                currentBinding={secretBindings[secretName] || ""}
                                availableSecrets={availableSecrets}
                                onMapDefault={handleMapDefault}
                                onSetAndMapDefault={handleSetAndMapDefault}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

BuilderSecretTab.displayName = "BuilderSecretTab";

export { BuilderSecretTab, SetSecretDialog };
