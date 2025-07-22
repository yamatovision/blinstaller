# BlueLamp Installer (Electron版)

BlueLamp AIをローカルPCに簡単にインストールするためのデスクトップアプリケーションです。

## 機能

- ✅ システム環境の自動検出（OS、Python、ディスク容量）
- ✅ BlueLamp AIの自動インストール（pip install）
- ✅ 設定ファイルの自動作成
- ✅ インストール進捗のリアルタイム表示
- ✅ エラーハンドリングとログ保存

## 開発環境セットアップ

```bash
# 依存関係インストール
cd electron-app
npm install

# 開発モードで起動（別ターミナルで）
# 1. Reactの開発サーバー起動
cd renderer
npm install
npm start

# 2. Electronアプリ起動
npm run dev
```

## ビルド方法

```bash
# 全プラットフォーム向けビルド
npm run dist

# Mac向けビルド
npm run dist-mac

# Windows向けビルド  
npm run dist-win

# Linux向けビルド
npm run dist-linux
```

## 配布ファイル

ビルド後、`dist`フォルダに以下のファイルが生成されます：

- **Mac**: `BlueLamp Installer-1.0.0.dmg` / `.zip`
- **Windows**: `BlueLamp Installer Setup 1.0.0.exe` / `.zip`
- **Linux**: `BlueLamp Installer-1.0.0.AppImage` / `.deb`

## 使用方法

1. 配布ファイルをダウンロード
2. インストーラーを起動
3. 「インストール開始」ボタンをクリック
4. インストール完了後、ターミナルで `ブルーランプ` コマンドが使用可能に

## 必要要件

- Python 3.12以上
- インターネット接続
- 1GB以上の空きディスク容量

## セキュリティ注意事項

現在、コード署名は行っていないため、以下の警告が表示される場合があります：

- **Mac**: 「開発元が未確認」→ 右クリックして「開く」を選択
- **Windows**: 「WindowsによってPCが保護されました」→「詳細情報」→「実行」

## トラブルシューティング

### インストールに失敗する場合

1. Python 3.12以上がインストールされているか確認
2. 管理者権限で実行してみる
3. ウイルス対策ソフトを一時的に無効化
4. ログを確認（インストール完了後「ログを保存」ボタン）

## ライセンス

MIT License