#!/bin/bash

echo "🌐 フロントエンド最新版デプロイ"
echo "================================"

echo "📝 現在の状況確認..."
git status

echo -e "\n📦 変更をステージング..."
git add .

echo -e "\n💾 コミット..."
git commit -m "Fix: フロントエンド表示修正

- APIから実際の研究者データを正しく取得・表示
- モックデータの表示問題を解決
- キャッシュクリア対応"

echo -e "\n🚀 プッシュ..."
git push origin main

echo -e "\n✅ デプロイ完了！"
echo "🔗 Vercel で自動デプロイが開始されます"
echo "📊 デプロイ状況はVercel Dashboardで確認"
echo ""
echo "🔄 キャッシュクリアのため以下を実行してください："
echo "  1. ブラウザでCtrl+Shift+R（ハードリフレッシュ）"
echo "  2. F12 > Network > 'Disable cache'をチェック"
echo "  3. ページをリロード"
