# 🚀 研究者検索プラットフォーム - 新規プロジェクト機能統合

## 📋 概要

既存のresearch-partner-dashboardに新規プロジェクト作成〜マッチング依頼送信の機能を統合しました。

### 🔄 フロー
1. **新規プロジェクト作成** → 基本情報入力
2. **仮プロジェクト作成完了** → プロジェクト保存
3. **研究者候補選択** → 検索・追加
4. **マッチング依頼送信** → メッセージ送信

## 📁 ファイル構成

### 📄 新規作成ファイル
```
research-partner-dashboard/
├── project-create.html          # プロジェクト作成フォーム
├── temp-project.html           # 仮プロジェクト管理画面
├── config.js                   # 設定ファイル
├── test-integration.html       # 統合テストページ
└── js/
    └── project-manager.js      # プロジェクト管理JavaScript
```

### 🔧 修正ファイル
```
research-partner-dashboard/
├── index.html                  # メインダッシュボード（仮プロジェクト表示追加）
└── api-client.js              # APIクライアント（プロジェクト管理API追加）
```

## 🚀 機能詳細

### 1. プロジェクト作成 (`project-create.html`)
- **機能**: 新規プロジェクトの基本情報入力
- **入力項目**:
  - プロジェクト名（必須）
  - プロジェクト概要（必須）
  - 予算（万円）
  - 期間（ヶ月）
  - 研究者要件
  - 関連キーワード
- **機能**:
  - 下書き保存
  - 自動保存（30秒間隔）
  - バリデーション

### 2. 仮プロジェクト管理 (`temp-project.html`)
- **機能**: 作成したプロジェクトの管理
- **タブ構成**:
  - 📊 **概要**: プロジェクト基本情報表示
  - 👨‍🔬 **研究者選択**: 研究者検索・候補追加
  - 🤝 **マッチング依頼**: 依頼メッセージ送信

### 3. プロジェクト管理API (`js/project-manager.js`)
- **API統合**: バックエンドAPIとの連携
- **フォールバック**: API利用不可時はローカルストレージ
- **機能**:
  - プロジェクト作成・取得
  - 研究者追加・削除
  - マッチング依頼送信
  - ステータス管理

### 4. 統合された研究者検索
- **既存機能拡張**: 検索結果から直接プロジェクトに追加
- **ボタン追加**: 「プロジェクト候補に追加」
- **自動連携**: 最新の仮プロジェクトに自動追加

## 🧪 テスト方法

### 1. 基本テスト
```bash
# ブラウザで以下のファイルを開く
test-integration.html
```

### 2. テスト項目
1. **ローカルストレージテスト** - データ保存・読み取り
2. **プロジェクト作成テスト** - 仮プロジェクト作成
3. **研究者追加テスト** - 候補者選択機能
4. **マッチング依頼テスト** - 依頼送信機能
5. **API統合テスト** - バックエンド連携
6. **フル統合テスト** - 全工程の通しテスト

### 3. テスト手順
1. `test-integration.html`をブラウザで開く
2. 各テストボタンをクリックして実行
3. 結果を確認（緑 = 成功、赤 = 失敗、黄 = 警告）
4. 最後に「フル統合テスト実行」で全体確認

## 🔧 設定・カスタマイズ

### 1. API設定 (`config.js`)
```javascript
const config = {
    api: {
        local: 'http://localhost:8000',      // ローカル開発
        production: 'https://your-app.railway.app',  // 本番環境
        current: 'local'  // 現在の環境
    }
};
```

### 2. 機能フラグ
```javascript
features: {
    useBackendAPI: true,        // バックエンドAPI統合
    useMockData: false,         // モックデータ使用
    enableLocalFallback: true   // ローカルフォールバック
}
```

## 🌐 バックエンド統合

### 必要なAPIエンドポイント
```
POST   /api/temp-projects              # 仮プロジェクト作成
GET    /api/temp-projects              # 仮プロジェクト一覧
GET    /api/temp-projects/{id}         # 特定プロジェクト取得
POST   /api/temp-projects/{id}/researchers   # 研究者追加
DELETE /api/temp-projects/{id}/researchers/{name}  # 研究者削除
POST   /api/temp-projects/{id}/matching-request    # マッチング依頼
PUT    /api/temp-projects/{id}/status  # ステータス更新
```

### データモデル
```python
class TempProject:
    id: str
    name: str
    description: str
    budget: Optional[int]
    duration: Optional[int]
    requirements: Optional[str]
    keywords: Optional[str]
    status: str  # draft, active, matching_requested, completed
    created_at: str
    selected_researchers: List[Dict]
```

## 🚀 デプロイ手順

### 1. ローカル環境
1. ファイルをWebサーバー配下に配置
2. `config.js`で`current: 'local'`に設定
3. バックエンドサーバーを起動（ポート8000）
4. ブラウザで`index.html`にアクセス

### 2. 本番環境
1. `config.js`で本番URLを設定
2. バックエンドAPIをデプロイ
3. フロントエンドファイルをWebサーバーにアップロード
4. CORS設定を確認

## 🐛 トラブルシューティング

### よくある問題と解決策

#### 1. API接続エラー
**症状**: 「API接続失敗」エラー
**原因**: バックエンドサーバーが起動していない
**解決策**: 
```bash
cd C:\Users\nozsu\researcher-search-app
python main.py
```

#### 2. CORS エラー
**症状**: ブラウザコンソールでCORSエラー
**原因**: バックエンドのCORS設定
**解決策**: `main.py`でCORS設定を確認
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発環境のみ
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

#### 3. ローカルストレージエラー
**症状**: データが保存されない
**原因**: ブラウザの設定またはプライベートモード
**解決策**: 
- 通常のブラウザモードで実行
- ブラウザのローカルストレージ設定を確認

#### 4. JavaScript読み込みエラー
**症状**: 「依存関係エラー」表示
**原因**: JavaScriptファイルのパスが間違っている
**解決策**: ファイル配置とパスを確認

## 📈 パフォーマンス最適化

### 1. ローカルストレージ
- 大量データ時の処理最適化
- データ圧縮の検討

### 2. API呼び出し
- タイムアウト設定（10-30秒）
- リトライ機能の実装

### 3. UI/UX
- ローディング表示
- プログレスバー
- エラーハンドリング

## 🔒 セキュリティ考慮事項

### 1. データ保護
- ローカルストレージの暗号化検討
- セッション管理の実装

### 2. API通信
- HTTPS通信の強制
- APIキー認証の実装

### 3. XSS対策
- ユーザー入力のサニタイズ
- CSP（Content Security Policy）の設定

## 🚀 今後の拡張予定

### 1. 機能追加
- [ ] プロジェクトテンプレート
- [ ] 協力者招待機能
- [ ] 進捗管理ダッシュボード
- [ ] 通知システム

### 2. UI/UX改善
- [ ] ドラッグ&ドロップでの研究者整理
- [ ] カンバンボード形式のプロジェクト管理
- [ ] モバイル対応強化

### 3. 統合機能
- [ ] カレンダー連携
- [ ] メール通知
- [ ] Slack/Teams連携
- [ ] 予算管理システム

## 📞 サポート

### 1. 開発者向け
- コードレビューが必要な場合は開発チームまで
- 新機能追加のプルリクエスト歓迎

### 2. ユーザー向け
- 操作方法に関する質問
- バグ報告
- 機能改善要望

---

**更新日**: 2024年6月9日  
**バージョン**: v2.1.0  
**作成者**: 研究者検索プラットフォーム開発チーム
