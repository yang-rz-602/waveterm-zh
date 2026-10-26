// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Modal } from "@/app/modals/modal";
import { recordTEvent } from "@/app/store/global";
import { useAtomValue } from "jotai";
import { memo } from "react";
import { WaveUIMessagePart } from "./aitypes";
import { WaveAIModel } from "./waveai-model";

interface RestoreBackupModalProps {
    part: WaveUIMessagePart & { type: "data-tooluse" };
}

export const RestoreBackupModal = memo(({ part }: RestoreBackupModalProps) => {
    const model = WaveAIModel.getInstance();
    const toolData = part.data;
    const status = useAtomValue(model.restoreBackupStatus);
    const error = useAtomValue(model.restoreBackupError);

    const formatTimestamp = (ts: number) => {
        if (!ts) return "";
        const date = new Date(ts);
        return date.toLocaleString();
    };

    const handleConfirm = () => {
        recordTEvent("waveai:revertfile", { "waveai:action": "revertfile:confirm" });
        model.restoreBackup(toolData.toolcallid, toolData.writebackupfilename, toolData.inputfilename);
    };

    const handleCancel = () => {
        recordTEvent("waveai:revertfile", { "waveai:action": "revertfile:cancel" });
        model.closeRestoreBackupModal();
    };

    const handleClose = () => {
        model.closeRestoreBackupModal();
    };

    if (status === "success") {
        return (
            <Modal className="restore-backup-modal pb-5 pr-5" onClose={handleClose} onOk={handleClose} okLabel={"关闭"}>
                <div className="flex flex-col gap-4 pt-4 pb-4 max-w-xl">
                    <div className="font-semibold text-lg text-green-500">备份恢复成功</div>
                    <div className="text-sm text-gray-300 leading-relaxed">
                        文件 <span className="font-mono text-white break-all">{toolData.inputfilename}</span> 已恢复到先前的状态。
                    </div>
                </div>
            </Modal>
        );
    }

    if (status === "error") {
        return (
            <Modal className="restore-backup-modal pb-5 pr-5" onClose={handleClose} onOk={handleClose} okLabel={"关闭"}>
                <div className="flex flex-col gap-4 pt-4 pb-4 max-w-xl">
                    <div className="font-semibold text-lg text-red-500">备份恢复失败</div>
                    <div className="text-sm text-gray-300 leading-relaxed">
                        恢复备份时发生错误：
                    </div>
                    <div className="text-sm text-red-400 font-mono bg-zinc-800 p-3 rounded break-all">{error}</div>
                </div>
            </Modal>
        );
    }

    const isProcessing = status === "processing";

    return (
        <Modal
            className="restore-backup-modal pb-5 pr-5"
            onClose={handleCancel}
            onCancel={handleCancel}
            onOk={handleConfirm}
            okLabel={isProcessing ? "Restoring..." : "确认恢复"}
            cancelLabel={"取消"}
            okDisabled={isProcessing}
            cancelDisabled={isProcessing}
        >
            <div className="flex flex-col gap-4 pt-4 pb-4 max-w-xl">
                <div className="font-semibold text-lg">恢复文件备份</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                    这将恢复 <span className="font-mono text-white break-all">{toolData.inputfilename}</span>{" "}
                    到此次编辑之前的状态
                    {toolData.runts && <span> ({formatTimestamp(toolData.runts)})</span>}.
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                    此次编辑及后续编辑所做的更改将被丢弃。
                </div>
            </div>
        </Modal>
    );
});

RestoreBackupModal.displayName = "RestoreBackupModal";