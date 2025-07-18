// api-client.js

class ResearcherSearchAPI {
    constructor() {
        this.baseURL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.baseURL) 
            ? API_CONFIG.baseURL 
            : (window.location.hostname === 'localhost' 
                ? 'http://localhost:8000' 
                : 'https://researcher-search-app-production.up.railway.app');
        
        console.log('API Base URL:', this.baseURL);
    }

    getCurrentApiUrl() {
        return this.baseURL;
    }

    async healthCheck() {
        try {
            const apiUrl = this.getCurrentApiUrl();
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('ヘルスチェック失敗:', error);
            let errorMessage = error.message;
            if (error.name === 'TypeError') errorMessage = 'ネットワーク接続エラー: APIサーバーにアクセスできません';
            if (error.name === 'TimeoutError') errorMessage = 'タイムアウト: APIサーバーの応答が遅すぎます';
            return { status: 'error', message: errorMessage };
        }
    }

    // ▼▼▼ この関数を全面的に修正 ▼▼▼
    async searchResearchers(searchParams) {
        try {
            const apiUrl = this.getCurrentApiUrl();
            console.log('API検索リクエスト:', searchParams); // 送信する全パラメータをログで確認

            const response = await fetch(`${apiUrl}/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // searchParamsオブジェクトをそのままJSONにして送信する
                body: JSON.stringify(searchParams),
                signal: AbortSignal.timeout(30000) // 30秒タイムアウト
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }));
                throw new Error(errorData.detail || 'サーバーエラーが発生しました。');
            }
            
            return await response.json();
        } catch (error) {
            console.error('searchResearchers API Error:', error);
            throw error;
        }
    }
    // ▲▲▲ 修正完了 ▲▲▲

    async generateSummary(researchmapUrl, query) {
        try {
            const apiUrl = this.getCurrentApiUrl();
            const response = await fetch(`${apiUrl}/api/generate-summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    researchmap_url: researchmapUrl,
                    query: query
                }),
                signal: AbortSignal.timeout(45000) // 45秒
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('AI要約生成エラー:', error);
            throw error;
        }
    }
    
    async analyzeResearcher(researchmapUrl, query, basicInfo) {
        try {
            const apiUrl = this.getCurrentApiUrl();
            const response = await fetch(`${apiUrl}/api/analyze-researcher`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    researchmap_url: researchmapUrl,
                    query: query,
                    researcher_basic_info: basicInfo
                }),
                signal: AbortSignal.timeout(60000) // 60秒
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('研究者分析エラー:', error);
            throw error;
        }
    }
}

// グローバルAPIクライアントインスタンス
const apiClient = new ResearcherSearchAPI();
