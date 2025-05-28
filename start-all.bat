@echo off
echo 🚀 リサーチパートナーシステム全体を起動します...
echo.

echo 📌 バックエンドサーバーを起動中...
start "Backend Server" cmd /k "cd /d C:\Users\nozsu\researcher-search-app && python main.py"

echo.
echo ⏳ バックエンドの起動を待機中...
timeout /t 5 /nobreak > nul

echo.
echo 📌 フロントエンドサーバーを起動中...
start "Frontend Server" cmd /k "cd /d %~dp0 && python -m http.server 3000"

echo.
echo ✅ 起動完了！
echo.
echo 🌐 アクセスURL:
echo    フロントエンド: http://localhost:3000
echo    バックエンドAPI: http://localhost:8000
echo.
echo 💡 終了するには、開いた両方のウィンドウで Ctrl+C を押してください
echo.

pause
