const config = {
    // API設定
    api: {
        // ローカル開発
        local: 'http://localhost:8000',
        
        // 本番環境（例：Railway）
        production: 'https://your-app.railway.app',
        
        // 現在の環境
        current: 'local'  // 'local' または 'production'
    },
    
    // 機能フラグ
    features: {
        useBackendAPI: true,        // バックエンドAPI統合
        useMockData: false,         // モックデータ使用
        enableLocalFallback: true   // ローカルフォールバック
    },
    
    // プロジェクト設定
    project: {
        maxResearchers: 10,         // 最大研究者選択数
        autoSaveInterval: 30000,    // 自動保存間隔（ミリ秒）
        statusUpdateInterval: 60000 // ステータス更新間隔
    },
    
    // UI設定
    ui: {
        itemsPerPage: 10,           // ページネーション設定
        searchResultsMax: 20,       // 検索結果最大表示数
        animationDuration: 300      // アニメーション時間（ミリ秒）
    }
};

// 設定の取得関数
function getApiUrl() {
    return config.api[config.api.current];
}

function isFeatureEnabled(feature) {
    return config.features[feature] || false;
}

function getProjectConfig(key) {
    return config.project[key];
}

// グローバル設定
window.config = config;

// 環境判定
window.isDevelopment = config.api.current === 'local';
window.isProduction = config.api.current === 'production';

console.log('🔧 設定ファイル読み込み完了:', {
    environment: config.api.current,
    apiUrl: getApiUrl(),
    features: Object.keys(config.features).filter(key => config.features[key])
});
