// Electron IPC通信サービス
// ブラウザ環境とElectron環境の両方で動作するように設計

interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo>;
  executeCommand: (command: string, options?: any) => Promise<CommandResult>;
  installBlueLamp: (options?: any) => Promise<InstallResult>;
  createConfig: (configContent: string) => Promise<ConfigResult>;
  checkPathExists: (path: string) => Promise<boolean>;
  saveLog: (logContent: string) => Promise<LogResult>;
  onInstallationProgress: (callback: (data: ProgressData) => void) => () => void;
}

interface SystemInfo {
  os: 'windows' | 'macos' | 'linux';
  osVersion: string;
  architecture: string;
  pythonVersion: string | null;
  pythonPath: string | null;
  pipVersion: string | null;
  cpuCores: number;
  totalMemory: number;
  freeMemory: number;
  diskSpace: number;
  homeDirectory: string;
  isAdmin: boolean;
}

interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

interface InstallResult {
  success: boolean;
  version: string;
  installOutput: string;
  verifyOutput: string;
}

interface ConfigResult {
  success: boolean;
  path: string;
}

interface LogResult {
  success: boolean;
  path: string;
}

interface ProgressData {
  step: string;
  progress: number;
  message: string;
}

class ElectronService {
  private api: ElectronAPI | null = null;

  constructor() {
    // Electron環境でのみAPIを初期化
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      this.api = (window as any).electronAPI;
    }
  }

  // Electron環境かどうかを判定
  isElectron(): boolean {
    return this.api !== null;
  }

  // システム情報取得
  async getSystemInfo(): Promise<SystemInfo> {
    if (!this.api) {
      // ブラウザ環境ではモックデータを返す
      return this.getMockSystemInfo();
    }
    return this.api.getSystemInfo();
  }

  // コマンド実行
  async executeCommand(command: string, options?: any): Promise<CommandResult> {
    if (!this.api) {
      throw new Error('この機能はElectron環境でのみ利用可能です');
    }
    return this.api.executeCommand(command, options);
  }

  // BlueLampインストール
  async installBlueLamp(options?: any): Promise<InstallResult> {
    if (!this.api) {
      throw new Error('この機能はElectron環境でのみ利用可能です');
    }
    return this.api.installBlueLamp(options);
  }

  // 設定ファイル作成
  async createConfig(configContent: string): Promise<ConfigResult> {
    if (!this.api) {
      throw new Error('この機能はElectron環境でのみ利用可能です');
    }
    return this.api.createConfig(configContent);
  }

  // パス存在確認
  async checkPathExists(path: string): Promise<boolean> {
    if (!this.api) {
      return false;
    }
    return this.api.checkPathExists(path);
  }

  // ログ保存
  async saveLog(logContent: string): Promise<LogResult> {
    if (!this.api) {
      throw new Error('この機能はElectron環境でのみ利用可能です');
    }
    return this.api.saveLog(logContent);
  }

  // インストール進捗監視
  onInstallationProgress(callback: (data: ProgressData) => void): () => void {
    if (!this.api) {
      return () => {};
    }
    return this.api.onInstallationProgress(callback);
  }

  // Python存在確認
  async checkPython(): Promise<{ exists: boolean; version?: string; path?: string }> {
    if (!this.api) {
      throw new Error('この機能はElectron環境でのみ利用可能です');
    }

    try {
      const systemInfo = await this.getSystemInfo();
      if (systemInfo.pythonVersion) {
        return {
          exists: true,
          version: systemInfo.pythonVersion,
          path: systemInfo.pythonPath || undefined
        };
      }
      return { exists: false };
    } catch {
      return { exists: false };
    }
  }

  // pip実行
  async pip(args: string): Promise<CommandResult> {
    if (!this.api) {
      throw new Error('この機能はElectron環境でのみ利用可能です');
    }

    const systemInfo = await this.getSystemInfo();
    const pythonCmd = systemInfo.os === 'windows' ? 'python' : 'python3';
    return this.executeCommand(`${pythonCmd} -m pip ${args}`);
  }

  // BlueLampバージョン確認
  async checkBlueLampVersion(): Promise<string | null> {
    if (!this.api) {
      return null;
    }

    try {
      const result = await this.pip('show bluelamp-ai');
      if (result.success) {
        const match = result.stdout.match(/Version: ([\d.]+)/);
        return match ? match[1] : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  // モックシステム情報（ブラウザ環境用）
  private getMockSystemInfo(): SystemInfo {
    const userAgent = navigator.userAgent;
    let os: 'windows' | 'macos' | 'linux' = 'linux';
    
    if (userAgent.includes('Windows')) {
      os = 'windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macos';
    }

    return {
      os,
      osVersion: 'Unknown',
      architecture: 'x64',
      pythonVersion: null,
      pythonPath: null,
      pipVersion: null,
      cpuCores: navigator.hardwareConcurrency || 4,
      totalMemory: 8,
      freeMemory: 4,
      diskSpace: 100,
      homeDirectory: '/home/user',
      isAdmin: false
    };
  }
}

// シングルトンインスタンスをエクスポート
export const electronService = new ElectronService();
export type { SystemInfo, CommandResult, InstallResult, ProgressData };