"""
フロントエンドキャッシュクリア用スクリプト
最新のAPIデータが表示されるように強制更新
"""

import webbrowser
import time

def open_fresh_frontend():
    """キャッシュを回避してフロントエンドを開く"""
    
    # フロントエンドURL（適切なURLに変更してください）
    frontend_urls = [
        "http://localhost:3000",  # ローカル開発
        "https://your-frontend.vercel.app",  # Vercel本番
        # 実際のフロントエンドURLに変更
    ]
    
    print("🌐 フロントエンドをキャッシュクリアで開きます")
    print("="*40)
    
    print("\n🔄 推奨手順:")
    print("1. ブラウザが開いたら F12 を押す")
    print("2. Network タブを選択")
    print("3. 'Disable cache' にチェック")
    print("4. Ctrl+Shift+R でハードリフレッシュ")
    print("5. 研究者検索で「医療」を検索して実際のデータが表示されるか確認")
    
    print(f"\n📊 期待される結果:")
    print("- たら澤 邦男 (東北大学大学院)")
    print("- 康永 秀生 (東京大学大学院医学系研究科)")
    print("- モックデータ（研究者A等）は表示されない")
    
    # 実際のフロントエンドURLを入力してもらう
    frontend_url = input("\n🌐 フロントエンドのURL (例: https://your-app.vercel.app): ").strip()
    
    if frontend_url:
        print(f"\n🚀 ブラウザで開きます: {frontend_url}")
        
        # タイムスタンプを追加してキャッシュを回避
        cache_buster = f"?v={int(time.time())}"
        final_url = frontend_url + cache_buster
        
        webbrowser.open(final_url)
        print("✅ ブラウザが開きました")
        print("\n💡 上記の手順でキャッシュをクリアしてください")
    else:
        print("❌ URLが入力されませんでした")

def show_verification_steps():
    """検証手順を表示"""
    print("\n🔍 検証手順:")
    print("="*20)
    
    print("\n1. 基本確認:")
    print("   - 検索で「医療」を入力")
    print("   - 実際の研究者名が表示される")
    print("   - 「研究者A」等のモックデータが表示されない")
    
    print("\n2. 詳細確認:")
    print("   - F12 > Console タブで以下のログを確認:")
    print("   - '📦 APIレスポンス全体' に実際のデータ")
    print("   - '✅ 実際のGCP検索が実行されています' メッセージ")
    
    print("\n3. 機能確認:")
    print("   - セマンティック検索/キーワード検索の切り替え")
    print("   - AI要約の表示")
    print("   - 若手研究者フィルタ")
    
    print("\n❌ もし問題が続く場合:")
    print("   - 別のブラウザで試す")
    print("   - シークレット/プライベートモードで開く")
    print("   - フロントエンドの再デプロイを実行")

if __name__ == "__main__":
    open_fresh_frontend()
    show_verification_steps()
