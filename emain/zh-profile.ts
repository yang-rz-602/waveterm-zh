// Local Simplified Chinese edition: keep all production user data recoverable.
import { app } from "electron";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import defaultWidgets from "../pkg/wconfig/defaultconfig/widgets.json";
import defaultAIModes from "../pkg/wconfig/defaultconfig/waveai.json";

export function initializeChineseProfile() {
    const home = app.getPath("home");
    const userData = process.env.WAVETERM_ZH_USER_DATA || path.join(app.getPath("appData"), "Wave-ZH");
    const config = process.env.WAVETERM_CONFIG_HOME || path.join(home, ".config", "waveterm-zh");
    const data = process.env.WAVETERM_DATA_HOME || path.join(app.getPath("appData").replace(/Roaming$/i, "Local"), "waveterm-zh", "Data");
    mkdirSync(userData, { recursive: true });
    mkdirSync(config, { recursive: true });
    mkdirSync(data, { recursive: true });
    app.setPath("userData", userData);
    app.commandLine.appendSwitch("lang", "zh-CN");
    process.env.WAVETERM_CONFIG_HOME = config;
    process.env.WAVETERM_DATA_HOME = data;

    const marker = path.join(config, ".zh-profile-initialized");
    if (existsSync(marker)) return;
    const originalConfig = path.join(home, ".config", "waveterm");
    // The encrypted store is bound to this Electron profile key and Windows user.
    // Copy the protected key together with the encrypted store; values stay encrypted.
    const originalState = path.join(app.getPath("appData"), "Wave", "Local State");
    const targetState = path.join(userData, "Local State");
    if (existsSync(originalState) && !existsSync(targetState)) copyFileSync(originalState, targetState);
    for (const name of ["settings.json", "connections.json", "secrets.enc", "waveai.json", "widgets.json", "backgrounds.json", "termthemes.json"]) {
        const source = path.join(originalConfig, name);
        const target = path.join(config, name);
        if (existsSync(source) && statSync(source).size > 0 && !existsSync(target)) copyFileSync(source, target);
    }
    const presets = path.join(originalConfig, "presets");
    if (existsSync(presets) && !existsSync(path.join(config, "presets"))) cpSync(presets, path.join(config, "presets"), { recursive: true });
    const labels: Record<string, string> = { terminal: "终端", files: "文件", web: "网页", sysinfo: "系统监控", processes: "进程" };
    const widgetsPath = path.join(config, "widgets.json");
    try {
        const widgets = existsSync(widgetsPath) ? JSON.parse(readFileSync(widgetsPath, "utf8")) : structuredClone(defaultWidgets);
        for (const item of Object.values(widgets) as {label?: string}[]) {
            if (item.label && labels[item.label]) item.label = labels[item.label];
        }
        writeFileSync(widgetsPath, JSON.stringify(widgets, null, 2) + "\n");
    } catch (error) {
        // Existing custom JSON remains available for the normal config diagnostics.
        console.warn("Chinese profile: widget labels were left unchanged", String(error));
    }
    const aiPath = path.join(config, "waveai.json");
    if (!existsSync(aiPath)) {
        const modes = structuredClone(defaultAIModes);
        modes["waveai@quick"]["display:name"] = "快速";
        modes["waveai@quick"]["display:description"] = "响应最快（gpt-5-mini）";
        modes["waveai@balanced"]["display:name"] = "均衡";
        modes["waveai@balanced"]["display:description"] = "兼顾速度与准确度\n（gpt-5.1，简短思考）";
        modes["waveai@deep"]["display:name"] = "深度";
        modes["waveai@deep"]["display:description"] = "深入推理，响应较慢\n（gpt-5.1，完整推理）";
        writeFileSync(aiPath, JSON.stringify(modes, null, 2) + "\n");
    }
    writeFileSync(marker, JSON.stringify({ edition: "0.14.5-zh.1", initializedAt: new Date().toISOString() }) + "\n");
}
