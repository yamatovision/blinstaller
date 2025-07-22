const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');
const fs = require('fs').promises;

const execAsync = promisify(exec);

let mainWindow;

// セキュリティ設定
app.commandLine.appendSwitch('disable-gpu-sandbox');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#f0f4f8'
  });

  // 開発モードではNext.jsの開発サーバーを使用
  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/out/index.html'));
  }

  // 外部リンクをデフォルトブラウザで開く
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// システム情報取得
ipcMain.handle('get-system-info', async () => {
  try {
    const platform = os.platform();
    const arch = os.arch();
    const release = os.release();
    const homeDir = os.homedir();
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    // Python情報取得
    let pythonVersion = null;
    let pythonPath = null;
    let pipVersion = null;

    try {
      const pythonCmd = platform === 'win32' ? 'python' : 'python3';
      const { stdout: pyVersion } = await execAsync(`${pythonCmd} --version`);
      pythonVersion = pyVersion.trim().replace('Python ', '');
      
      const { stdout: pyPath } = await execAsync(`${platform === 'win32' ? 'where' : 'which'} ${pythonCmd}`);
      pythonPath = pyPath.trim().split('\n')[0];
      
      const { stdout: pipVer } = await execAsync(`${pythonCmd} -m pip --version`);
      pipVersion = pipVer.match(/pip ([\d.]+)/)?.[1] || null;
    } catch (error) {
      console.error('Python detection error:', error);
    }

    // ディスク容量
    let diskSpace = 0;
    try {
      if (platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
        // Windows disk space parsing
        const lines = stdout.trim().split('\n').slice(1);
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3 && parts[0] === 'C:') {
            diskSpace = Math.floor(parseInt(parts[1]) / (1024 * 1024 * 1024));
            break;
          }
        }
      } else {
        const { stdout } = await execAsync(`df -BG ${homeDir} | tail -1`);
        const available = stdout.match(/(\d+)G/);
        if (available) {
          diskSpace = parseInt(available[1]);
        }
      }
    } catch (error) {
      console.error('Disk space detection error:', error);
    }

    return {
      os: platform === 'win32' ? 'windows' : platform === 'darwin' ? 'macos' : 'linux',
      osVersion: release,
      architecture: arch === 'x64' ? 'x86_64' : arch,
      pythonVersion,
      pythonPath,
      pipVersion,
      cpuCores: cpus.length,
      totalMemory: Math.floor(totalMemory / (1024 * 1024 * 1024)),
      freeMemory: Math.floor(freeMemory / (1024 * 1024 * 1024)),
      diskSpace,
      homeDirectory: homeDir,
      isAdmin: process.platform === 'win32' ? false : process.getuid() === 0
    };
  } catch (error) {
    console.error('System info error:', error);
    throw error;
  }
});

// コマンド実行
ipcMain.handle('execute-command', async (event, command, options = {}) => {
  try {
    console.log('Executing command:', command);
    const { stdout, stderr } = await execAsync(command, {
      encoding: 'utf8',
      timeout: options.timeout || 300000, // 5分のタイムアウト
      maxBuffer: 10 * 1024 * 1024, // 10MB
      ...options
    });
    
    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    };
  } catch (error) {
    console.error('Command execution error:', error);
    return {
      success: false,
      error: error.message,
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || ''
    };
  }
});

// BlueLamp インストール
ipcMain.handle('install-bluelamp', async (event, options = {}) => {
  try {
    const platform = os.platform();
    const pythonCmd = platform === 'win32' ? 'python' : 'python3';
    const pipCmd = `${pythonCmd} -m pip`;
    
    // 進捗を送信する関数
    const sendProgress = (step, progress, message) => {
      event.sender.send('installation-progress', { step, progress, message });
    };

    sendProgress('checking', 10, 'Python環境を確認中...');
    
    // Python確認
    const { stdout: pyVersion } = await execAsync(`${pythonCmd} --version`);
    sendProgress('checking', 30, `Python ${pyVersion.trim()} を検出`);
    
    // pip アップグレード
    sendProgress('preparing', 40, 'pipを最新版に更新中...');
    await execAsync(`${pipCmd} install --upgrade pip`);
    
    // BlueLamp インストール
    sendProgress('installing', 60, 'BlueLamp AIをインストール中...');
    const { stdout, stderr } = await execAsync(`${pipCmd} install bluelamp-ai --upgrade`);
    
    // インストール確認
    sendProgress('verifying', 80, 'インストールを確認中...');
    const { stdout: verifyOutput } = await execAsync(`${pipCmd} show bluelamp-ai`);
    
    // バージョン取得
    const versionMatch = verifyOutput.match(/Version: ([\d.]+)/);
    const version = versionMatch ? versionMatch[1] : 'unknown';
    
    sendProgress('completed', 100, `BlueLamp AI v${version} のインストールが完了しました`);
    
    return {
      success: true,
      version,
      installOutput: stdout,
      verifyOutput
    };
  } catch (error) {
    console.error('Installation error:', error);
    throw error;
  }
});

// 設定ファイル作成
ipcMain.handle('create-config', async (event, configContent) => {
  try {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.bluelamp');
    const configPath = path.join(configDir, 'config.yaml');
    
    // ディレクトリ作成
    await fs.mkdir(configDir, { recursive: true });
    
    // 設定ファイル書き込み
    await fs.writeFile(configPath, configContent, 'utf8');
    
    return {
      success: true,
      path: configPath
    };
  } catch (error) {
    console.error('Config creation error:', error);
    throw error;
  }
});

// ファイル/ディレクトリ存在確認
ipcMain.handle('check-path-exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

// ログ保存
ipcMain.handle('save-log', async (event, logContent) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logDir = path.join(app.getPath('documents'), 'BlueLamp Installer Logs');
    const logPath = path.join(logDir, `install-log-${timestamp}.txt`);
    
    await fs.mkdir(logDir, { recursive: true });
    await fs.writeFile(logPath, logContent, 'utf8');
    
    return {
      success: true,
      path: logPath
    };
  } catch (error) {
    console.error('Log save error:', error);
    throw error;
  }
});