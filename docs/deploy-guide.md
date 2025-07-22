# BlueLamp Installer 配布ガイド

## 配布方法

### 方法1: GitHub Releases（推奨）

1. **ビルド実行**
```bash
cd electron-app
npm install
npm run dist  # 全OS向けビルド
```

2. **GitHubにリリース作成**
- リポジトリの「Releases」タブ → 「Create a new release」
- タグ: `v1.0.0`
- タイトル: `BlueLamp Installer v1.0.0`
- ビルドファイルをアップロード:
  - `dist/BlueLamp-Installer-Setup-1.0.0.exe` (Windows)
  - `dist/BlueLamp-Installer-1.0.0.dmg` (macOS)
  - `dist/BlueLamp-Installer-1.0.0.AppImage` (Linux)

3. **ダウンロードページ更新**
- `download-page/index.html`のURLを実際のGitHub ReleasesのURLに更新
- 例: `https://github.com/yourusername/bluelamp-installer/releases/download/v1.0.0/...`

### 方法2: Firebase Hosting

既存のFirebaseプロジェクトを使用：

```bash
# 1. ダウンロードページをビルド
cd download-page

# 2. Firebaseにデプロイ
firebase deploy --only hosting:downloads

# 3. アクセスURL
https://bluelamp-downloads.web.app/
```

### 方法3: Vercel/Netlify（無料）

```bash
# Vercelの場合
npm i -g vercel
cd download-page
vercel

# Netlifyの場合
# download-pageフォルダをドラッグ&ドロップでアップロード
```

## ダウンロードページの機能

- ✅ **自動OS検出**: 訪問者のOSを自動判定
- ✅ **適切なダウンロードボタン表示**: OS別に最適なファイル形式を提案
- ✅ **代替ダウンロード**: 他のOS向けのリンクも表示
- ✅ **レスポンシブ対応**: スマホでも見やすい

## カスタマイズ

### ダウンロードURLの設定

`index.html`の`DOWNLOADS`オブジェクトを編集：

```javascript
const DOWNLOADS = {
    windows: {
        downloads: [{
            url: 'あなたの実際のダウンロードURL',
            // ...
        }]
    }
    // ...
};
```

### CDN利用（大容量ファイル用）

- **GitHub Releases**: 2GBまで無料
- **AWS S3 + CloudFront**: 従量課金
- **Cloudflare R2**: 無料枠あり
- **Google Drive**: 直リンク生成可能（非推奨）

## セキュリティ考慮事項

1. **HTTPS必須**: ダウンロードページは必ずHTTPS配信
2. **チェックサム提供**: SHA256ハッシュを表示
3. **ウイルススキャン**: VirusTotalリンクを追加

## アナリティクス追加（オプション）

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

これでダウンロード数を追跡できます。