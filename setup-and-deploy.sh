#!/bin/bash

echo "🚀 BlueLamp Installer セットアップ & デプロイスクリプト"
echo "================================================"

# 1. Gitリポジトリ初期化
echo ""
echo "📁 Gitリポジトリを初期化中..."
git init
git add .
git commit -m "Initial commit: BlueLamp Installer Electron app"

# 2. GitHubリポジトリ作成の指示
echo ""
echo "📌 GitHubでリポジトリを作成してください:"
echo "   1. https://github.com/new にアクセス"
echo "   2. Repository name: bluelamp-installer"
echo "   3. Public を選択"
echo "   4. Create repository をクリック"
echo ""
echo "作成したら、以下のコマンドを実行してください:"
echo ""
echo "git remote add origin https://github.com/YOUR_USERNAME/bluelamp-installer.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
read -p "GitHubリポジトリを作成してリモートを追加しましたか？ (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "リポジトリ作成後に再度実行してください。"
    exit 1
fi

# 3. Mac用ビルド（ローカル）
echo ""
echo "🍎 Mac版をビルド中..."
npm run dist-mac

# 4. リリース作成
echo ""
echo "📦 GitHubリリースを作成中..."
VERSION="1.0.0"
TAG="v$VERSION"

# タグ作成
git tag -a $TAG -m "Release $VERSION"
git push origin $TAG

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "📌 次のステップ:"
echo "1. https://github.com/YOUR_USERNAME/bluelamp-installer/releases にアクセス"
echo "2. 'Draft a new release' をクリック"
echo "3. Tag: $TAG を選択"
echo "4. 以下のファイルをアップロード:"
echo "   - dist/BlueLamp-Installer-*.dmg"
echo "   - dist/BlueLamp-Installer-*.zip"
echo "5. 'Publish release' をクリック"
echo ""
echo "📌 ダウンロードページの設定:"
echo "1. download-page/index.html の DOWNLOADS オブジェクトにリリースURLを設定"
echo "2. GitHubリポジトリの Settings > Pages で GitHub Pages を有効化"
echo "3. Source: Deploy from a branch"
echo "4. Branch: main, Folder: /download-page を選択"
echo "5. Save をクリック"
echo ""
echo "数分後、https://YOUR_USERNAME.github.io/bluelamp-installer/ でダウンロードページが公開されます！"