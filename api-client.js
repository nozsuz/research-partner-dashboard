// api-client.js (最終修正版)

class ResearcherSearchAPI {
    constructor() {
        // config.jsからAPIのベースURLを取得 (フォールバック付き)
        this.baseURL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.baseURL) 
            ? API_CONFIG.baseURL 
            : (window.location.hostname === 'localhost' || !window.location.hostname
                ? 'http://localhost:8000' 
                : 'https://researcher-search-app-production.up.railway.app');
        
        console.log('API Base URL:', this.baseURL);
    }
    
    // 現在の有効なAPI URLを取得
    getCurrentApiUrl() {
        if (typeof validatedApiUrl !== 'undefined' && validatedApiUrl) {
            return validatedApiUrl;
        }
        return this.baseURL;
    }

    // ヘルスチェック
    async healthCheck() {
        try {
            const apiUrl = this.getCurrentApiUrl();
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000) // 10秒タイムアウト
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('ヘルスチェック失敗:', error);
            let errorMessage = error.message;
            if (error.name === 'TypeError') {
                errorMessage = 'ネットワーク接続エラー: APIサーバーにアクセスできません';
            } else if (error.name === 'TimeoutError') {
                errorMessage = 'タイムアウト: APIサーバーの応答が遅すぎます';
            }
            return { 
                status: 'error', 
                message: errorMessage,
            };
        }
    }

    // 研究者検索（メイン機能）
    async searchResearchers(searchParams) {
        try {
            const apiUrl = this.getCurrentApiUrl();
            console.log('API検索リクエスト:', searchParams); // 送信する全パラメータをログで確認

            const response = await fetch(`${apiUrl}/api/search`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                // searchParamsオブジェクトをそのままJSONにして送信
                body: JSON.stringify(searchParams),
                signal: AbortSignal.timeout(30000) // 30秒タイムアウト
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }));
                throw new Error(errorData.detail || 'サーバーエラーが発生しました。');
            }
            
            return await response.json();

        } catch (error) {
            console.error('API検索エラー:', error);
            let errorMessage = error.message;
            if (error.name === 'TypeError') {
                errorMessage = 'ネットワーク接続エラー: API検索サーバーにアクセスできません';
            } else if (error.name === 'TimeoutError') {
                errorMessage = 'タイムアウト: 検索処理に時間がかかりすぎています';
            }
            throw new Error(errorMessage);
        }
    }

    // 大学一覧を取得
    async getUniversities() {
        try {
            const response = await fetch(`${this.getCurrentApiUrl()}/api/universities`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('大学一覧取得エラー:', error);
            throw error;
        }
    }

    // =============================================================================
    // プロジェクト管理・詳細分析API（変更なし）
    // =============================================================================

    async createTempProject(projectData) {
        try {
            const response = await fetch(`${this.getCurrentApiUrl()}/api/temp-projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
                signal: AbortSignal.timeout(15000)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('仮プロジェクト作成エラー:', error);
            throw error;
        }
    }

    async getTempProjects(userId = null) {
        try {
            const url = new URL(`${this.getCurrentApiUrl()}/api/temp-projects`);
            if (userId) {
                url.searchParams.append('user_id', userId);
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('仮プロジェクト一覧取得エラー:', error);
            throw error;
        }
    }

    async addResearcherToProject(projectId, researcherData) {
        try {
            const response = await fetch(`${this.getCurrentApiUrl()}/api/temp-projects/${projectId}/researchers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(researcherData),
                signal: AbortSignal.timeout(15000)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('研究者追加エラー:', error);
            throw error;
        }
    }
    
    async analyzeResearcher(researchmapUrl, query, basicInfo = null, includeKeywordMap = false) {
        try {
            const requestData = {
                researchmap_url: researchmapUrl,
                query: query,
                researcher_basic_info: basicInfo,
                include_keyword_map: includeKeywordMap
            };
            const response = await fetch(`${this.getCurrentApiUrl()}/api/analyze-researcher`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
                signal: AbortSignal.timeout(60000) // 60秒
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('研究者分析エラー:', error);
            throw error;
        }
    }
}

// グローバルAPIクライアントインスタンス
const apiClient = new ResearcherSearchAPI();
