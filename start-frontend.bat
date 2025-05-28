@echo off
echo 🚀 リサーチパートナーダッシュボード フロントエンドを起動しています...
echo.
echo 📍 作業ディレクトリ: %cd%
echo.

echo 🌐 ローカルサーバーを起動します...
echo 📡 URL: http://localhost:3000
echo.
echo 💡 停止するには Ctrl+C を押してください
echo.

python -m http.server 3000

pause
