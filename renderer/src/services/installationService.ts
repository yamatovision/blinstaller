// インストールサービス（Electron版）
// BlueLampのローカルインストールを管理

import { electronService, SystemInfo, ProgressData } from './electronService';

export interface InstallationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  message?: string;
  error?: string;
}

export interface InstallationSession {
  id: string;
  status: 'idle' | 'preparing' | 'installing' | 'completed' | 'failed';
  systemInfo?: SystemInfo;
  steps: InstallationStep[];
  overallProgress: number;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
}

class InstallationService {
  private session: InstallationSession | null = null;
  private progressListeners: ((session: InstallationSession) => void)[] = [];

  // インストールステップの定義
  private readonly STEPS: Omit<InstallationStep, 'status' | 'progress'>[] = [
    { id: 'system-check', name: 'システム環境確認' },
    { id: 'python-check', name: 'Python環境確認' },
    { id: 'pip-upgrade', name: 'pip更新' },
    { id: 'bluelamp-install', name: 'BlueLamp AIインストール' },
    { id: 'config-create', name: '設定ファイル作成' },
    { id: 'verification', name: 'インストール検証' }
  ];

  // 新しいセッション作成
  createSession(): InstallationSession {
    this.session = {
      id: this.generateSessionId(),
      status: 'idle',
      steps: this.STEPS.map(step => ({
        ...step,
        status: 'pending',
        progress: 0
      })),
      overallProgress: 0,
      logs: []
    };
    return this.session;
  }

  // インストール開始
  async startInstallation(): Promise<void> {
    if (!this.session) {
      this.createSession();
    }

    this.updateSessionStatus('preparing');
    this.addLog('インストールを開始します...');

    try {
      // 1. システム環境確認
      await this.executeStep('system-check', async () => {
        const systemInfo = await electronService.getSystemInfo();
        this.session!.systemInfo = systemInfo;
        
        this.addLog(`OS: ${systemInfo.os} ${systemInfo.osVersion}`);
        this.addLog(`アーキテクチャ: ${systemInfo.architecture}`);
        this.addLog(`空きディスク容量: ${systemInfo.diskSpace}GB`);
        
        return { success: true };
      });

      // 2. Python環境確認
      await this.executeStep('python-check', async () => {
        const pythonInfo = await electronService.checkPython();
        
        if (!pythonInfo.exists) {
          throw new Error('Pythonがインストールされていません。先にPythonをインストールしてください。');
        }
        
        this.addLog(`Python ${pythonInfo.version} を検出`);
        this.addLog(`Pythonパス: ${pythonInfo.path}`);
        
        // Pythonバージョンチェック
        const version = pythonInfo.version!.split('.');
        const major = parseInt(version[0]);
        const minor = parseInt(version[1]);
        
        if (major < 3 || (major === 3 && minor < 12)) {
          throw new Error('Python 3.12以上が必要です。');
        }
        
        return { success: true };
      });

      // 3. pip更新
      await this.executeStep('pip-upgrade', async () => {
        this.addLog('pipを最新版に更新中...');
        const result = await electronService.pip('install --upgrade pip');
        
        if (!result.success) {
          throw new Error(`pip更新失敗: ${result.error || result.stderr}`);
        }
        
        this.addLog('pip更新完了');
        return { success: true };
      });

      // 4. BlueLampインストール
      await this.executeStep('bluelamp-install', async () => {
        this.addLog('BlueLamp AIをインストール中...');
        
        // 進捗リスナー設定
        const unsubscribe = electronService.onInstallationProgress((data: ProgressData) => {
          const step = this.session!.steps.find(s => s.id === 'bluelamp-install');
          if (step) {
            step.progress = data.progress;
            step.message = data.message;
            this.notifyProgress();
          }
        });

        try {
          const result = await electronService.installBlueLamp();
          
          if (!result.success) {
            throw new Error('インストールに失敗しました');
          }
          
          this.addLog(`BlueLamp AI v${result.version} をインストールしました`);
          return { success: true };
        } finally {
          unsubscribe();
        }
      });

      // 5. 設定ファイル作成
      await this.executeStep('config-create', async () => {
        this.addLog('設定ファイルを作成中...');
        
        const configContent = this.generateConfigContent();
        const result = await electronService.createConfig(configContent);
        
        if (!result.success) {
          throw new Error('設定ファイルの作成に失敗しました');
        }
        
        this.addLog(`設定ファイルを作成: ${result.path}`);
        return { success: true };
      });

      // 6. インストール検証
      await this.executeStep('verification', async () => {
        this.addLog('インストールを検証中...');
        
        // BlueLampバージョン確認
        const version = await electronService.checkBlueLampVersion();
        if (!version) {
          throw new Error('BlueLampが正しくインストールされていません');
        }
        
        // CLIコマンド確認
        const cliResult = await electronService.executeCommand('ブルーランプ --version');
        if (!cliResult.success) {
          this.addLog('警告: CLIコマンドが見つかりません。PATHの設定が必要な場合があります。');
        }
        
        this.addLog('インストール検証完了');
        return { success: true };
      });

      // 完了
      this.updateSessionStatus('completed');
      this.addLog('🎉 BlueLamp AIのインストールが完了しました！');
      
    } catch (error) {
      this.updateSessionStatus('failed');
      this.addLog(`❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ステップ実行
  private async executeStep(
    stepId: string,
    handler: () => Promise<{ success: boolean }>
  ): Promise<void> {
    const step = this.session!.steps.find(s => s.id === stepId);
    if (!step) return;

    try {
      step.status = 'running';
      this.notifyProgress();

      const result = await handler();
      
      if (result.success) {
        step.status = 'completed';
        step.progress = 100;
      } else {
        step.status = 'failed';
      }
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.updateOverallProgress();
      this.notifyProgress();
    }
  }

  // セッション状態更新
  private updateSessionStatus(status: InstallationSession['status']): void {
    if (!this.session) return;
    
    this.session.status = status;
    
    if (status === 'preparing') {
      this.session.startedAt = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      this.session.completedAt = new Date().toISOString();
    }
    
    this.notifyProgress();
  }

  // 全体進捗更新
  private updateOverallProgress(): void {
    if (!this.session) return;
    
    const completedSteps = this.session.steps.filter(s => s.status === 'completed').length;
    this.session.overallProgress = Math.floor((completedSteps / this.session.steps.length) * 100);
  }

  // ログ追加
  private addLog(message: string): void {
    if (!this.session) return;
    
    const timestamp = new Date().toLocaleTimeString();
    this.session.logs.push(`[${timestamp}] ${message}`);
    this.notifyProgress();
  }

  // 進捗通知
  private notifyProgress(): void {
    if (!this.session) return;
    
    this.progressListeners.forEach(listener => {
      listener(this.session!);
    });
  }

  // 進捗リスナー登録
  onProgress(listener: (session: InstallationSession) => void): () => void {
    this.progressListeners.push(listener);
    return () => {
      this.progressListeners = this.progressListeners.filter(l => l !== listener);
    };
  }

  // 現在のセッション取得
  getCurrentSession(): InstallationSession | null {
    return this.session;
  }

  // セッションIDを生成
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // 設定ファイル内容生成
  private generateConfigContent(): string {
    return `# BlueLamp AI Configuration
# Generated by BlueLamp Installer

[general]
version = "2.1.0"
language = "ja"

[ai]
default_model = "claude-3"

[paths]
workspace = "~/bluelamp-workspace"

[features]
auto_save = true
`;
  }

  // ログ保存
  async saveInstallationLog(): Promise<string | null> {
    if (!this.session) return null;
    
    try {
      const logContent = [
        `BlueLamp Installation Log`,
        `Session ID: ${this.session.id}`,
        `Started: ${this.session.startedAt}`,
        `Completed: ${this.session.completedAt}`,
        `Status: ${this.session.status}`,
        ``,
        `System Information:`,
        JSON.stringify(this.session.systemInfo, null, 2),
        ``,
        `Installation Steps:`,
        ...this.session.steps.map(step => 
          `- ${step.name}: ${step.status} (${step.progress}%)`
        ),
        ``,
        `Logs:`,
        ...this.session.logs
      ].join('\n');
      
      const result = await electronService.saveLog(logContent);
      return result.success ? result.path : null;
    } catch {
      return null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const installationService = new InstallationService();