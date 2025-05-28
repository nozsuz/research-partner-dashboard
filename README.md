# リサーチパートナー・ダッシュボード

研究者検索・プロジェクト管理・契約サポート・資金調達支援を提供するダッシュボードのフロントエンドアプリケーションです。

## 機能

- 🔍 研究者検索（バックエンドAPI連携）
- 📊 プロジェクト管理
- 📄 契約・知財サポート
- 💰 資金調達サポート
- ⚙️ アカウント設定

## 🌐 デプロイ環境

- **本番環境フロントエンド**: https://research-partner-dashboard.vercel.app
- **本番環境バックエンドAPI**: https://researcher-search-app-production.up.railway.app
- **フロントエンドホスティング**: Vercel
- **バックエンドホスティング**: Railway

## 🚀 クイックスタート

### 1. バックエンドの起動

```bash
# Windows の場合
start-backend.bat

# または手動で
cd C:\Users\nozsu\researcher-search-app
python main.py
```

バックエンドは http://localhost:8000 で起動します。

### 2. フロントエンドの起動

```bash
# 方法1: index.html をブラウザで直接開く

# 方法2: ローカルサーバーを使用（推奨）
python -m http.server 3000

# または Node.js の場合
npx http-server -p 3000
```

### 3. アクセス

ブラウザで以下のいずれかにアクセス:
- http://localhost:3000 （ローカルサーバー使用時）
- file:///C:/Users/nozsu/research-partner-dashboard/index.html （直接開く場合）

## 🔧 設定

### API URLの変更

`config.js` ファイルを編集してバックエンドのURLを変更できます：

```javascript
const API_CONFIG = {
    // 環境に応じて自動切り替え
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000'  // ローカル開発時
        : 'https://researcher-search-app-production.up.railway.app'  // Railway本番環境
};
```

## 📁 ファイル構成

```
research-partner-dashboard/
├── index.html              # メインページ
├── project-detail.html     # プロジェクト詳細ページ
├── config.js              # API設定
├── start-backend.bat      # バックエンド起動スクリプト
├── api-client.js          # APIクライアント（レガシー）
├── README.md              # このファイル
└── ...
```

## 🔍 研究者検索機能

### 検索オプション
- **検索方法**: セマンティック検索 / キーワード検索
- **AIによるキーワード拡張**: キーワード検索時に関連語を自動追加
- **AIによる関連性要約**: 検索結果に研究者と検索キーワードの関連性を要約表示
- **最大表示件数**: 1〜20件まで調整可能

### 使い方
1. 検索キーワードを入力（例: 人工知能、再生医療、ナノ材料）
2. 検索オプションを設定
3. 「研究者を検索」ボタンをクリック
4. 検索結果から研究者の詳細を確認

## 🛠️ 開発

### バックエンドとの連携確認

1. ブラウザの開発者ツール（F12）を開く
2. コンソールタブでAPIの接続状態を確認
3. ネットワークタブでAPIリクエスト/レスポンスを確認

### トラブルシューティング

**Q: API接続エラーが表示される**
- バックエンドサーバーが起動しているか確認
- `config.js` のURLが正しいか確認
- CORSエラーの場合はバックエンドの設定を確認

**Q: 検索結果が表示されない**
- ブラウザコンソールでエラーを確認
- ネットワークタブでAPIレスポンスを確認

## 技術スタック

- HTML5
- CSS3
- JavaScript (Vanilla)
- FastAPI (バックエンド)
- Vercel (デプロイ)

## ライセンス

このプロジェクトはデモ用です。