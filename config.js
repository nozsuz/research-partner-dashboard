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
console.log('Frontend URL:', window.location.origin);

// Railway URLの複数候補を試す機能
const RAILWAY_URL_CANDIDATES = [
    'https://researcher-search-app-production.up.railway.app',
    'https://researcher-search-app.up.railway.app', 
    'https://main-production.up.railway.app'
];

// 自動URL検出機能
let validatedApiUrl = null;

// API URLの有効性を確認する関数（CORSエラー対応）
async function validateApiUrl(url) {
    try {
        console.log(`🔍 ${url} を検証中...`);
        
        // まずシンプルなGETリクエストでルートエンドポイントをテスト
        const response = await fetch(`${url}/`, {
            method: 'GET',
            mode: 'cors', // CORSを明示的に指定
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(8000) // 8秒タイムアウト
        });
        
        console.log(`🟢 ${url}: HTTP ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            // レスポンスがJSONであるか確認
            const data = await response.json();
            if (data.message && data.message.includes('研究者検索API')) {
                console.log(`✅ ${url}: 正常な研究者検索APIサーバーです`);
                return true;
            } else {
                console.log(`⚠️ ${url}: レスポンスが期待値と異なります`);
                return false;
            }
        } else {
            console.log(`🔴 ${url}: HTTPエラー ${response.status}`);
            return false;
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('CORS')) {
            console.log(`🟡 ${url}: CORSエラー - サーバーは存在するがアクセスできません`);
        } else if (error.name === 'TimeoutError') {
            console.log(`⏱️ ${url}: タイムアウト`);
        } else {
            console.log(`🔴 ${url}: ${error.name} - ${error.message}`);
        }
        return false;
    }
}

// 最適なAPI URLを自動検出
async function detectBestApiUrl() {
    console.log('🔍 API URL自動検出開始...');
    
    // ローカル環境の場合は検証をスキップ
    if (window.location.hostname === 'localhost') {
        console.log('🏠 ローカル環境です - 検証をスキップ');
        validatedApiUrl = API_CONFIG.baseURL;
        return API_CONFIG.baseURL;
    }
    
    // まず設定されたURLを試す
    if (await validateApiUrl(API_CONFIG.baseURL)) {
        console.log('✅ 設定されたURL有効:', API_CONFIG.baseURL);
        validatedApiUrl = API_CONFIG.baseURL;
        return API_CONFIG.baseURL;
    }
    
    // 候補URLを順番に試す
    for (const url of RAILWAY_URL_CANDIDATES) {
        if (url === API_CONFIG.baseURL) continue; // 既にテスト済みはスキップ
        
        console.log('🔍 候補URL検証中:', url);
        if (await validateApiUrl(url)) {
            console.log('✅ 有効なURL発見:', url);
            validatedApiUrl = url;
            API_CONFIG.baseURL = url; // 設定を更新
            return url;
        }
    }
    
    console.warn('⚠️ 有効なAPI URLが見つかりませんでした - デフォルトを使用');
    validatedApiUrl = API_CONFIG.baseURL; // フォールバックとしてデフォルトを設定
    return API_CONFIG.baseURL; // フォールバック
}

// ページ読み込み時にAPI URL検出を実行
if (window.location.hostname !== 'localhost') {
    // Vercel環境や他の本番環境でのみ実行
    detectBestApiUrl().then(url => {
        console.log('🎯 最終決定API URL:', url);
        
        // DOMが読み込み済みの場合は即座にヘルスチェックを実行
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            if (typeof checkAPIHealth === 'function') {
                setTimeout(checkAPIHealth, 1000);
            }
        }
    }).catch(error => {
        console.error('🔴 API URL検出エラー:', error);
    });
}
