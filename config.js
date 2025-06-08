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
console.log('Current hostname:', window.location.hostname);

// Railway URLの複数候補を試す機能
const RAILWAY_URL_CANDIDATES = [
    'https://researcher-search-app-production.up.railway.app',
    'https://researcher-search-app.up.railway.app',
    'https://main-production.up.railway.app'
];

// 自動URL検出機能
let validatedApiUrl = null;

// API URLの有効性を確認する関数
async function validateApiUrl(url) {
    try {
        const response = await fetch(`${url}/`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        });
        return response.ok;
    } catch {
        return false;
    }
}

// 最適なAPI URLを自動検出
async function detectBestApiUrl() {
    console.log('🔍 API URL自動検出開始...');
    
    // まず設定されたURLを試す
    if (await validateApiUrl(API_CONFIG.baseURL)) {
        console.log('✅ 設定されたURL有効:', API_CONFIG.baseURL);
        validatedApiUrl = API_CONFIG.baseURL;
        return API_CONFIG.baseURL;
    }
    
    // 候補URLを順番に試す
    for (const url of RAILWAY_URL_CANDIDATES) {
        console.log('🔍 候補URL検証中:', url);
        if (await validateApiUrl(url)) {
            console.log('✅ 有効なURL発見:', url);
            validatedApiUrl = url;
            API_CONFIG.baseURL = url; // 設定を更新
            return url;
        }
    }
    
    console.warn('⚠️ 有効なAPI URLが見つかりませんでした');
    return API_CONFIG.baseURL; // フォールバック
}

// ページ読み込み時にAPI URL検出を実行
if (window.location.hostname !== 'localhost') {
    detectBestApiUrl().then(url => {
        console.log('🎯 最終決定API URL:', url);
    });
}
