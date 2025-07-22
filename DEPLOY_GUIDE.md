# BlueLamp Installer デプロイ完全ガイド

## 🚀 クイックスタート

### 1. GitHubリポジトリ作成

1. [GitHub](https://github.com/new) で新規リポジトリ作成
   - Repository name: `bluelamp-installer`
   - Public を選択
   - Create repository

2. ローカルリポジトリと接続
```bash
cd /Users/tatsuya/Desktop/BlueLamp/installer/electron-app
git init
git add .
git commit -m "Initial commit: BlueLamp Installer"
git remote add origin https://github.com/YOUR_USERNAME/bluelamp-installer.git
git branch -M main
git push -u origin main
```

### 2. Mac版ビルド（ローカル）

```bash
# Mac版をビルド
npm run dist-mac

# ビルド完了後、distフォルダを確認
ls -la dist/
```

### 3. GitHubリリース作成

1. タグを作成してプッシュ
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

2. [GitHub Releases](https://github.com/YOUR_USERNAME/bluelamp-installer/releases) にアクセス
3. "Create a new release" をクリック
4. Tag: `v1.0.0` を選択
5. Release title: `BlueLamp Installer v1.0.0`
6. ファイルをドラッグ&ドロップ:
   - `dist/BlueLamp Installer-1.0.0.dmg`
   - `dist/BlueLamp Installer-1.0.0-mac.zip`
7. "Publish release" をクリック

### 4. ダウンロードページ設定

1. `download-page/index.html` を編集してURLを更新:
```javascript
const DOWNLOADS = {
    mac: {
        downloads: [
            {
                url: 'https://github.com/YOUR_USERNAME/bluelamp-installer/releases/download/v1.0.0/BlueLamp-Installer-1.0.0.dmg',
                // ...
            }
        ]
    }
    // ...
};
```

2. 変更をコミット&プッシュ
```bash
git add download-page/index.html
git commit -m "Update download URLs"
git push
```

### 5. GitHub Pages有効化

1. リポジトリの Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: `/download-page`
4. Save

数分後、以下のURLでアクセス可能:
```
https://YOUR_USERNAME.github.io/bluelamp-installer/
```

## 📱 Windows/Linux版の追加

後日、以下の環境でビルド:
- Windows: `npm run dist-win`
- Linux: `npm run dist-linux`

## 🔧 トラブルシューティング

### ビルドエラー
- Node.js 18以上が必要
- `npm install` を再実行

### GitHub Pages が表示されない
- Settings → Pages で設定を確認
- 数分待つ（初回は時間がかかる）

### ダウンロードリンクが機能しない
- GitHubリリースのURLを正確にコピー
- ファイル名が一致しているか確認

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。