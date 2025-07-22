import React, { useState, useEffect } from 'react';
import { installationService, InstallationSession } from './services/installationService';
import { electronService } from './services/electronService';
import './App.css';

function App() {
  const [session, setSession] = useState<InstallationSession | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // システム情報を取得
    electronService.getSystemInfo().then(setSystemInfo).catch(console.error);
    
    // インストール進捗の監視
    const unsubscribe = installationService.onProgress(setSession);
    return unsubscribe;
  }, []);

  const startInstallation = async () => {
    setIsInstalling(true);
    setError(null);
    
    try {
      installationService.createSession();
      await installationService.startInstallation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インストールに失敗しました');
    } finally {
      setIsInstalling(false);
    }
  };

  const saveLog = async () => {
    const logPath = await installationService.saveInstallationLog();
    if (logPath) {
      alert(`ログを保存しました: ${logPath}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💡 BlueLamp Installer</h1>
        <p>BlueLamp AIを簡単にインストール</p>
      </header>

      <main className="App-main">
        {/* システム情報 */}
        {systemInfo && (
          <div className="system-info card">
            <h2>システム情報</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">OS:</span>
                <span className="value">{systemInfo.os} {systemInfo.osVersion}</span>
              </div>
              <div className="info-item">
                <span className="label">アーキテクチャ:</span>
                <span className="value">{systemInfo.architecture}</span>
              </div>
              <div className="info-item">
                <span className="label">Python:</span>
                <span className="value">
                  {systemInfo.pythonVersion || '未検出'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">空きディスク:</span>
                <span className="value">{systemInfo.diskSpace}GB</span>
              </div>
            </div>
          </div>
        )}

        {/* インストール進捗 */}
        {session && (
          <div className="installation-progress card">
            <h2>インストール進捗</h2>
            <div className="overall-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${session.overallProgress}%` }}
                />
              </div>
              <span className="progress-text">{session.overallProgress}%</span>
            </div>

            <div className="steps">
              {session.steps.map(step => (
                <div key={step.id} className={`step ${step.status}`}>
                  <div className="step-header">
                    <span className="step-icon">
                      {step.status === 'completed' && '✅'}
                      {step.status === 'running' && '🔄'}
                      {step.status === 'failed' && '❌'}
                      {step.status === 'pending' && '⏳'}
                    </span>
                    <span className="step-name">{step.name}</span>
                  </div>
                  {step.message && (
                    <div className="step-message">{step.message}</div>
                  )}
                  {step.error && (
                    <div className="step-error">{step.error}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="logs">
              <h3>ログ</h3>
              <div className="log-content">
                {session.logs.map((log, index) => (
                  <div key={index} className="log-line">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="error-message card">
            <h3>❌ エラー</h3>
            <p>{error}</p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="actions">
          {!session || session.status === 'idle' || session.status === 'failed' ? (
            <button 
              className="btn btn-primary"
              onClick={startInstallation}
              disabled={isInstalling}
            >
              {isInstalling ? '準備中...' : 'インストール開始'}
            </button>
          ) : session.status === 'completed' ? (
            <>
              <button className="btn btn-success" disabled>
                ✅ インストール完了
              </button>
              <button 
                className="btn btn-secondary"
                onClick={saveLog}
              >
                ログを保存
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" disabled>
              インストール中...
            </button>
          )}
        </div>

        {/* 使い方 */}
        <div className="usage card">
          <h2>使い方</h2>
          <ol>
            <li>Python 3.12以上がインストールされていることを確認</li>
            <li>「インストール開始」ボタンをクリック</li>
            <li>インストール完了まで待機（約1-2分）</li>
            <li>ターミナルで <code>ブルーランプ</code> と入力して起動</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

export default App;