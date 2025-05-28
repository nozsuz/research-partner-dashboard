@echo off
echo 🚀 研究者検索バックエンドサーバーを起動しています...
echo.
echo 📍 作業ディレクトリ: C:\Users\nozsu\researcher-search-app
echo.

cd /d C:\Users\nozsu\researcher-search-app

echo 🔧 Python仮想環境をアクティベート中...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate
) else if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate
) else (
    echo ⚠️ 仮想環境が見つかりません。グローバルPythonを使用します。
)

echo.
echo 🏃 バックエンドサーバーを起動します...
echo 📡 URL: http://localhost:8000
echo.
echo 💡 停止するには Ctrl+C を押してください
echo.

python main.py

pause
