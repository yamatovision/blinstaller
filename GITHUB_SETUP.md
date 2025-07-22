# GitHub リポジトリセットアップ手順

## 1. GitHubで新規リポジトリ作成

1. https://github.com/new にアクセス
2. 以下の設定で作成:
   - **Repository name**: `bluelamp-installer`
   - **Description**: BlueLamp AI Installer - 簡単セットアップツール
   - **Public** を選択
   - **Initialize this repository with:** は全てチェックを外す
   - **Create repository** をクリック

## 2. ローカルリポジトリとGitHubを接続

作成後に表示されるコマンドをコピーして実行:

```bash
# あなたのGitHubユーザー名を使用
git remote add origin https://github.com/YOUR_USERNAME/bluelamp-installer.git
git branch -M main
git push -u origin main
```

## 3. リリースの作成

```bash
# タグを作成
git tag -a v1.0.0 -m "Release v1.0.0 - Initial release"
git push origin v1.0.0
```

## 4. GitHub Releasesでファイルアップロード

1. https://github.com/YOUR_USERNAME/bluelamp-installer/releases/new にアクセス
2. **Tag**: `v1.0.0` を選択
3. **Release title**: `BlueLamp Installer v1.0.0`
4. **Description**: 
   ```
   ## BlueLamp Installer v1.0.0
   
   BlueLamp AIを簡単にインストールできるデスクトップアプリケーション
   
   ### ダウンロード
   - **Mac (Intel)**: BlueLamp Installer-1.0.0-mac.zip
   - **Mac (Apple Silicon)**: BlueLamp Installer-1.0.0-arm64-mac.zip
   
   ### 使い方
   1. ZIPファイルをダウンロード
   2. 解凍して BlueLamp Installer.app を実行
   3. 「インストール開始」ボタンをクリック
   
   ### 注意
   初回起動時に「開発元が未確認」の警告が表示される場合は、
   右クリック → 「開く」を選択してください。
   ```
5. **ファイルをドラッグ&ドロップ**:
   - `dist/BlueLamp Installer-1.0.0-mac.zip`
   - `dist/BlueLamp Installer-1.0.0-arm64-mac.zip`
   - `dist/BlueLamp Installer-1.0.0-arm64.dmg` (オプション)
6. **Publish release** をクリック

## 5. ダウンロードページの更新

1. `download-page/index.html` を編集
2. YOUR_USERNAMEを実際のGitHubユーザー名に置換
3. コミット & プッシュ:
   ```bash
   git add download-page/index.html
   git commit -m "Update download URLs with actual GitHub release links"
   git push
   ```

## 6. GitHub Pages有効化

1. https://github.com/YOUR_USERNAME/bluelamp-installer/settings/pages にアクセス
2. **Source**: Deploy from a branch
3. **Branch**: main
4. **Folder**: `/download-page`
5. **Save** をクリック

数分後、以下のURLでアクセス可能になります:
```
https://YOUR_USERNAME.github.io/bluelamp-installer/
```