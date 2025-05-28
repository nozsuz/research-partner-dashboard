// API設定
const API_CONFIG = {
    // バックエンドAPIのURL設定
    // 環境に応じて自動切り替え
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000'  // ローカル開発時
        : 'https://researcher-search-app-production.up.railway.app'  // Railway本番環境
};

// デバッグ情報
console.log('Environment:', window.location.hostname === 'localhost' ? 'Development' : 'Production');
console.log('API Base URL:', API_CONFIG.baseURL);
