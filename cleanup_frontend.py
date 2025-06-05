import os

# フロントエンドディレクトリのパス
frontend_dir = r"C:\Users\nozsu\research-partner-dashboard"

# 削除するファイルのリスト
files_to_delete = [
    # 重複・古いバージョンのファイル
    "api-client-debug.js",
    "api-client-fixed.js",
    "api-client-production.js",
    "simple-test.js",
    "debug-search.js",
    
    # テスト・開発用ファイル
    "api-test.html",
    "index-ending.html",
    
    # バッチファイル
    "start-all.bat",
    "start-backend.bat",
    "start-frontend.bat",
    
    # Vercel設定の重複
    "vercel-minimal.json",
    "vercel-simple.json",
    
    # 環境変数テンプレート
    ".env.example"
]

# ファイルを削除
os.chdir(frontend_dir)
deleted_count = 0
not_found_count = 0

for file in files_to_delete:
    file_path = os.path.join(frontend_dir, file)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            print(f"✅ 削除成功: {file}")
            deleted_count += 1
        except Exception as e:
            print(f"❌ 削除失敗: {file} - {e}")
    else:
        print(f"⚠️ ファイルが見つかりません: {file}")
        not_found_count += 1

print(f"\n🎉 フロントエンドのクリーンアップ完了！")
print(f"削除成功: {deleted_count}個")
print(f"見つからなかった: {not_found_count}個")
