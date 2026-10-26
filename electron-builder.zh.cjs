const base = require('./electron-builder.config.cjs');
const path = require('path');
module.exports = {
    ...base,
    appId: 'dev.local.waveterm.zh',
    productName: 'Wave-ZH',
    executableName: 'Wave-ZH',
    artifactName: 'Wave-ZH-0.14.5-zh.1-windows-x64.${ext}',
    electronVersion: '41.1.0',
    electronDist: path.join(__dirname, 'node_modules/electron/dist'),
    publish: null,
    generateUpdatesFilesForAllChannels: false,
    win: { target: ['zip'], signAndEditExecutable: false },
    directories: { output: 'make-zh' },
};
