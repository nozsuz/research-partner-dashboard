# デプロイメントガイド

## 🚀 デプロイ構成

- **フロントエンド**: Vercel
- **バックエンド**: Railway

## 📍 本番環境URL

- **フロントエンド**: https://research-partner-dashboard.vercel.app
- **バックエンドAPI**: https://researcher-search-app-production.up.railway.app

## 🔧 フロントエンド（Vercel）

### デプロイ手順

1. GitHubリポジトリをVercelに接続
2. ビルド設定:
   - Framework Preset: Other
   - Build Command: （空欄）
   - Output Directory: .
   - Install Command: （空欄）

### 環境変数

Vercelダッシュボードで設定（Settings > Environment Variables）:
```
なし（config.jsで自動切り替え）
```

### デプロイコマンド

```bash
# Vercel CLIを使用する場合
vercel --prod
```

## 🔧 バックエンド（Railway）

### デプロイ済みURL
https://researcher-search-app-production.up.railway.app

### 必要な環境変数（Railway）

```
# 基本設定
PROJECT_ID=apt-rope-217206
LOCATION=us-central1
BIGQUERY_TABLE=apt-rope-217206.researcher_data.rd_250524

# GCP認証（必要に応じて）
ENABLE_GCP_INITIALIZATION=true
GCP_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GCP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
# ... その他のGCP認証情報
```

### ヘルスチェック

バックエンドが正常に動作しているか確認:
```bash
curl https://researcher-search-app-production.up.railway.app/health
```

## 🔗 CORS設定

バックエンド（main.py）でCORSが正しく設定されていることを確認:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では特定のドメインに制限推奨
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📋 デプロイ後の確認

### 1. フロントエンドの確認
1. https://research-partner-dashboard.vercel.app にアクセス
2. ダッシュボードが正しく表示されることを確認

### 2. API接続の確認
1. 研究者検索ページに移動
2. 「🟢 API接続正常」が表示されることを確認
3. 検索機能が正常に動作することを確認

### 3. ブラウザコンソールの確認
```
Environment: Production
API Base URL: https://researcher-search-app-production.up.railway.app
```

## 🐛 トラブルシューティング

### CORS エラー
**症状**: ブラウザコンソールに「CORS policy」エラー

**対処法**:
1. Railwayのバックエンドでmain.pyのCORS設定を確認
2. 特定のドメインからのみアクセスを許可する場合:
```python
allow_origins=[
    "https://research-partner-dashboard.vercel.app",
    "http://localhost:3000"
]
```

### API接続エラー
**症状**: 「🔴 API接続失敗」

**対処法**:
1. Railway ダッシュボードでバックエンドの状態を確認
2. https://researcher-search-app-production.up.railway.app にアクセスして応答を確認
3. Railwayのログを確認

### 環境変数の問題
**症状**: APIが正しく動作しない

**対処法**:
1. Railwayダッシュボードで環境変数が正しく設定されているか確認
2. 特にGCP関連の認証情報が正しいか確認

## 📊 モニタリング

### Vercel
- Analytics: https://vercel.com/[your-account]/[project]/analytics
- Logs: https://vercel.com/[your-account]/[project]/logs

### Railway
- Metrics: Railwayダッシュボード > Metrics
- Logs: Railwayダッシュボード > Logs

## 🔄 更新方法

### フロントエンド
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercelが自動的にデプロイ
```

### バックエンド
```bash
# researcher-search-appリポジトリで
git add .
git commit -m "Update backend"
git push origin main
# Railwayが自動的にデプロイ
```

## 📝 注意事項

1. **APIキー**: 本番環境では適切なAPIキーやトークンを使用してセキュリティを強化
2. **CORS**: 本番環境では `allow_origins` を特定のドメインに制限
3. **環境変数**: センシティブな情報は必ず環境変数として管理
4. **HTTPS**: 両方のサービスでHTTPSが有効になっていることを確認
