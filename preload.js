const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスに安全なAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // システム情報取得
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // コマンド実行
  executeCommand: (command, options) => ipcRenderer.invoke('execute-command', command, options),
  
  // BlueLamp インストール
  installBlueLamp: (options) => ipcRenderer.invoke('install-bluelamp', options),
  
  // 設定ファイル作成
  createConfig: (configContent) => ipcRenderer.invoke('create-config', configContent),
  
  // パス存在確認
  checkPathExists: (path) => ipcRenderer.invoke('check-path-exists', path),
  
  // ログ保存
  saveLog: (logContent) => ipcRenderer.invoke('save-log', logContent),
  
  // インストール進捗リスナー
  onInstallationProgress: (callback) => {
    ipcRenderer.on('installation-progress', (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('installation-progress');
  }
});

// セキュリティのため、Node.js APIへの直接アクセスは遮断
window.addEventListener('DOMContentLoaded', () => {
  console.log('BlueLamp Installer - Electron Environment Ready');
});