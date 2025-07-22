#!/bin/bash

# アイコン生成スクリプト
# 簡易的な青いランプアイコンを生成

mkdir -p assets

# macOS用アイコン作成コマンド（ImageMagickが必要）
echo "Creating icon files..."

# 基本的な青いランプのSVGを作成
cat > assets/icon.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- ランプの傘 -->
  <path d="M256 80 C 150 80, 80 150, 80 256 L 432 256 C 432 150, 362 80, 256 80" 
        fill="#667eea" stroke="#764ba2" stroke-width="8"/>
  
  <!-- ランプの光 -->
  <ellipse cx="256" cy="256" rx="140" ry="20" fill="#ffd700" opacity="0.8"/>
  
  <!-- ランプの支柱 -->
  <rect x="246" y="256" width="20" height="120" fill="#764ba2"/>
  
  <!-- ランプの台座 -->
  <ellipse cx="256" cy="380" rx="80" ry="30" fill="#764ba2"/>
  
  <!-- 光の効果 -->
  <circle cx="256" cy="180" r="30" fill="#ffffff" opacity="0.6"/>
</svg>
EOF

echo "✅ SVGアイコンを作成しました"

# PNGファイルを生成（手動変換が必要）
echo "⚠️  注意: SVGからPNG/ICO/ICNSへの変換は手動で行ってください"
echo "推奨ツール:"
echo "  - オンラインコンバーター: https://cloudconvert.com/"
echo "  - macOS: iconutil コマンド"
echo "  - Windows: https://icoconvert.com/"

echo ""
echo "必要なアイコンファイル:"
echo "  - assets/icon.png (512x512)"
echo "  - assets/icon.ico (Windows用)"
echo "  - assets/icon.icns (macOS用)"