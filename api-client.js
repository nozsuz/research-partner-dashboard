// 改良されたAPI設定とユーティリティ関数
class ResearcherSearchAPI {
    constructor() {
        // config.jsからAPIのベースURLを取得
        // config.jsが読み込まれていない場合のフォールバック付き
        this.baseURL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.baseURL) 
            ? API_CONFIG.baseURL 
            : (window.location.hostname === 'localhost' 
                ? 'http://localhost:8000' 
                : 'https://researcher-search-app-production.up.railway.app');
        
        console.log('API Base URL (initial):', this.baseURL);
        console.log('Current hostname:', window.location.hostname);
        console.log('Validated API URL available:', typeof validatedApiUrl !== 'undefined' ? validatedApiUrl : 'Not yet validated');
    }
    
    // 現在の有効なAPI URLを取得
    getCurrentApiUrl() {
        // validatedApiUrlが存在する場合はそれを使用
        if (typeof validatedApiUrl !== 'undefined' && validatedApiUrl) {
            return validatedApiUrl;
        }
        // そうでなければAPI_CONFIGから取得
        return (typeof API_CONFIG !== 'undefined' && API_CONFIG.baseURL) 
            ? API_CONFIG.baseURL 
            : this.baseURL;
    }

    // ヘルスチェック（改良版）
    async healthCheck() {
        try {
            const apiUrl = this.getCurrentApiUrl();
            console.log('ヘルスチェック開始:', `${apiUrl}/health`);
            
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // タイムアウト設定
                signal: AbortSignal.timeout(10000) // 10秒タイムアウト
            });
            
            console.log('ヘルスチェックレスポンス:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('ヘルスチェック結果:', data);
            return data;
            
        } catch (error) {
            console.error('ヘルスチェック失敗:', error);
            
            // エラータイプによる詳細メッセージ
            let errorMessage = error.message;
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'ネットワーク接続エラー: APIサーバーにアクセスできません';
            } else if (error.name === 'TimeoutError') {
                errorMessage = 'タイムアウト: APIサーバーの応答が遅すぎます';
            }
            
            return { 
                status: 'error', 
                message: errorMessage,
                url: `${this.getCurrentApiUrl()}/health`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 簡易接続テスト
    async simpleConnectionTest() {
        try {
            const apiUrl = this.getCurrentApiUrl();
            console.log('簡易接続テスト開始:', `${apiUrl}/`);
            
            const response = await fetch(`${apiUrl}/`, {
                method: 'GET',
                mode: 'cors', // CORS を明示的に指定
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(5000) // 5秒タイムアウト
            });
            
            console.log('簡易接続テスト結果:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                return { status: 'success', data: data };
            } else {
                return { 
                    status: 'error', 
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    details: 'APIサーバーは稼働していますが、エラーが発生しています'
                };
            }
            
        } catch (error) {
            console.error('簡易接続テスト失敗:', error);
            
            return { 
                status: 'error', 
                message: error.message,
                details: 'APIサーバーに接続できません',
                possibleCauses: [
                    'Railwayサーバーが停止している',
                    'URLが間違っている',
                    'CORS設定の問題',
                    'ネットワーク接続の問題'
                ]
            };
        }
    }

    // 研究者検索（メイン機能）- 改良版
    async searchResearchers(searchParams) {
        try {
            const {
                query,
                method = 'semantic',
                maxResults = 5,
                useLLMExpansion = false,
                useLLMSummary = false
            } = searchParams;

            const apiUrl = this.getCurrentApiUrl();
            console.log('API検索開始:', searchParams);
            console.log('リクエストURL:', `${apiUrl}/api/search`);

            // POSTリクエストでAPIを呼び出し
            const response = await fetch(`${apiUrl}/api/search`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    method: method,
                    max_results: maxResults,
                    use_llm_expansion: useLLMExpansion,
                    use_llm_summary: useLLMSummary,
                    young_researcher_filter: searchParams.youngResearcherFilter || false,
                    university_filter: searchParams.universityFilter || null
                }),
                signal: AbortSignal.timeout(30000) // 30秒タイムアウト
            });

            console.log('API検索レスポンス:', response.status, response.statusText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
                }
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('API検索成功:', data);
            return data;

        } catch (error) {
            console.error('API検索エラー:', error);
            
            // エラータイプに応じた詳細メッセージ
            let errorMessage = error.message;
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'ネットワーク接続エラー: API検索サーバーにアクセスできません';
            } else if (error.name === 'TimeoutError') {
                errorMessage = 'タイムアウト: 検索処理に時間がかかりすぎています';
            }
            
            throw new Error(errorMessage);
        }
    }

    // GET版検索（テスト用）- 改良版
    async searchResearchersGET(searchParams) {
        try {
            const {
                query,
                method = 'semantic',
                maxResults = 5,
                useLLMExpansion = false,
                useLLMSummary = false
            } = searchParams;

            const params = new URLSearchParams({
                query: query,
                method: method,
                max_results: maxResults.toString(),
                use_llm_expansion: useLLMExpansion.toString(),
                use_llm_summary: useLLMSummary.toString()
            });

            const apiUrl = this.getCurrentApiUrl();
            console.log('GET検索開始:', `${apiUrl}/api/search?${params}`);

            const response = await fetch(`${apiUrl}/api/search?${params}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(30000)
            });
            
            console.log('GET検索レスポンス:', response.status, response.statusText);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
                }
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('GET検索成功:', data);
            return data;

        } catch (error) {
            console.error('GET検索エラー:', error);
            throw error;
        }
    }

    // =============================================================================
    // プロジェクト管理API
    // =============================================================================

    /**
     * 仮プロジェクトを作成
     */
    async createTempProject(projectData) {
        try {
            const response = await fetch(`${this.getCurrentApiUrl()}/api/temp-projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('仮プロジェクト作成エラー:', error);
            throw error;
        }
    }

    /**
     * 仮プロジェクト一覧を取得
     */
    async getTempProjects(userId = null) {
        try {
            const url = new URL(`${this.getCurrentApiUrl()}/api/temp-projects`);
            if (userId) {
                url.searchParams.append('user_id', userId);
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('仮プロジェクト一覧取得エラー:', error);
            throw error;
        }
    }

    /**
     * 特定の仮プロジェクトを取得
     */
    async getTempProject(projectId) {
        try {
            const response = await fetch(`${this.getCurrentApiUrl()}/api/temp-projects/${projectId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('仮プロジェクト取得エラー:', error);
            throw error;
        }
    }

    /**
     * プロジェクトに研究者を追加
     */
    async addResearcherToProject(projectId, researcherData) {
        try {
            const requestData = {
                project_id: projectId,
                researcher_name: researcherData.name,
                researcher_affiliation: researcherData.affiliation,
                researchmap_url: researcherData.researchmap_url || null,
                selection_reason: researcherData.selection_reason || null
            };

            const response = await fetch(`${this.getCurrentApiUrl()}/api/temp-projects/${projectId}/researchers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('研究者追加エラー:', error);
            throw error;
        }
    }

    /**
     * プロジェクトから研究者を削除
     */
    async removeResearcherFromProject(projectId, researcherName) {
        try {
            const encodedName = encodeURIComponent(researcherName);
            const response = await fetch(`${this.getCurrentApiUrl()}/api/temp-projects/${projectId}/researchers/${encodedName}`, {
                method: 'DELETE',
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
            console.error('研究者削除エラー:', error);
            throw error;
        }
    }

    /**
     * マッチング依頼を送信
     */
    async submitMatchingRequest(projectId, message, priority = 'normal') {
        try {
            const requestData = {
                project_id: projectId,
                message: message,
                priority: priority
            };

            const response = await fetch(`${this.getCurrentApiUrl()}/api/temp-projects/${projectId}/matching-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
                signal: AbortSignal.timeout(20000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('マッチング依頼エラー:', error);
            throw error;
        }
    }

    /**
     * プロジェクトステータスを更新
     */
    async updateProjectStatus(projectId, status) {
        try {
            const url = new URL(`${this.getCurrentApiUrl()}/api/temp-projects/${projectId}/status`);
            url.searchParams.append('status', status);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('ステータス更新エラー:', error);
            throw error;
        }
    }

    /**
     * 研究者詳細分析API
     */
    async analyzeResearcher(researchmapUrl, query, basicInfo = null) {
        try {
            const requestData = {
                researchmap_url: researchmapUrl,
                query: query,
                researcher_basic_info: basicInfo
            };

            const response = await fetch(`${this.getCurrentApiUrl()}/api/analyze-researcher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
                signal: AbortSignal.timeout(60000) // 60秒タイムアウト（分析時間を考慮）
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('研究者分析エラー:', error);
            throw error;
        }
    }

    /**
     * 大学一覧を取得
     */
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
}

// グローバルAPIクライアントインスタンス
const apiClient = new ResearcherSearchAPI();

// 仮プロジェクト作成フロー用関数
function createNewProject() {
    // プロジェクト作成画面へ遷移
    window.location.href = 'project-create.html';
}

// プロジェクト詳細画面への遷移
function viewTempProject(projectId) {
    window.location.href = `temp-project.html?id=${projectId}`;
}

// セッションID管理
function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

// 分析結果を保存
async function saveAnalysis(analysisData) {
    try {
        const apiUrl = apiClient.getCurrentApiUrl();
        const response = await fetch(`${apiUrl}/api/save-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...analysisData,
                session_id: getOrCreateSessionId()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('分析結果保存成功:', result);
        return result;
        
    } catch (error) {
        console.error('分析結果保存エラー:', error);
        throw error;
    }
}

// 保存済み分析を取得
async function getSavedAnalyses(query = null) {
    try {
        const apiUrl = apiClient.getCurrentApiUrl();
        const response = await fetch(`${apiUrl}/api/get-saved-analyses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: getOrCreateSessionId(),
                query: query,
                limit: 50
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('保存済み分析取得エラー:', error);
        throw error;
    }
}

// 分析結果を削除
async function deleteAnalysis(analysisId) {
    try {
        const sessionId = getOrCreateSessionId();
        const apiUrl = apiClient.getCurrentApiUrl();
        const response = await fetch(
            `${apiUrl}/api/delete-analysis/${analysisId}?session_id=${sessionId}`,
            {
                method: 'DELETE'
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('分析結果削除エラー:', error);
        throw error;
    }
}

// 接続診断関数（新規追加）
async function performConnectionDiagnostic() {
    const resultsContainer = document.getElementById('api-search-results');
    
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            接続診断を実行中...
        </div>
    `;
    
    // 診断結果収集
    const diagnostics = [];
    
    // 1. 簡易接続テスト
    console.log('🔍 簡易接続テスト開始');
    const connectionTest = await apiClient.simpleConnectionTest();
    diagnostics.push({
        test: '簡易接続テスト',
        result: connectionTest.status,
        details: connectionTest.message || connectionTest.data?.message || 'N/A',
        icon: connectionTest.status === 'success' ? '🟢' : '🔴'
    });
    
    // 2. ヘルスチェック
    console.log('🔍 ヘルスチェック開始');
    const healthCheck = await apiClient.healthCheck();
    diagnostics.push({
        test: 'APIヘルスチェック',
        result: healthCheck.status,
        details: healthCheck.message || 'N/A',
        icon: healthCheck.status === 'healthy' ? '🟢' : '🔴'
    });
    
    // 診断結果表示
    let diagnosticHtml = `
        <div class="alert alert-info">
            <h4>🔧 接続診断結果</h4>
            <table class="data-table" style="margin-top: 15px;">
                <thead>
                    <tr>
                        <th>テスト項目</th>
                        <th>結果</th>
                        <th>詳細</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    diagnostics.forEach(diag => {
        diagnosticHtml += `
            <tr>
                <td>${diag.icon} ${diag.test}</td>
                <td>${diag.result}</td>
                <td>${diag.details}</td>
            </tr>
        `;
    });
    
    diagnosticHtml += `
                </tbody>
            </table>
            <hr>
            <p><strong>API URL:</strong> ${apiClient.getCurrentApiUrl()}</p>
            <p><strong>実行時刻:</strong> ${new Date().toLocaleString()}</p>
        </div>
    `;
    
    resultsContainer.innerHTML = diagnosticHtml;
}

// ヘルスチェック関数（改良版）
async function checkAPIHealth() {
    try {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.style.display = 'block';
            statusElement.innerHTML = '🔄 API接続確認中...';
            statusElement.className = 'alert alert-info';
        }
        
        // 簡易接続テストとヘルスチェックを並行実行
        const [connectionTest, healthCheck] = await Promise.all([
            apiClient.simpleConnectionTest(),
            apiClient.healthCheck()
        ]);
        
        console.log('接続テスト結果:', connectionTest);
        console.log('ヘルスチェック結果:', healthCheck);
        
        if (statusElement) {
            if (connectionTest.status === 'success' && healthCheck.status === 'healthy') {
                statusElement.innerHTML = '🟢 API接続正常 - サーバー稼働中';
                statusElement.className = 'alert alert-success';
            } else if (connectionTest.status === 'success') {
                statusElement.innerHTML = '🟡 API接続可能 - 一部機能に制限あり';
                statusElement.className = 'alert alert-warning';
            } else {
                statusElement.innerHTML = `🔴 API接続失敗 - ${connectionTest.message}`;
                statusElement.className = 'alert alert-warning';
            }
        }
        
    } catch (error) {
        console.error('API Health Check Error:', error);
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.innerHTML = `🔴 API接続エラー - ${error.message}`;
            statusElement.className = 'alert alert-warning';
        }
    }
}

// 検索方法の切り替え関数（変更なし）
function toggleAPISearchMode(mode) {
    const apiContainer = document.getElementById('api-container');
    const mockContainer = document.getElementById('mock-container');
    const streamlitContainer = document.getElementById('streamlit-container');
    const apiBtn = document.getElementById('api-btn');
    const mockBtn = document.getElementById('mock-btn');
    const embeddedBtn = document.getElementById('embedded-btn');
    
    // すべてのコンテナを非表示
    if (apiContainer) apiContainer.style.display = 'none';
    if (mockContainer) mockContainer.style.display = 'none';
    if (streamlitContainer) streamlitContainer.style.display = 'none';
    
    // すべてのボタンをセカンダリに
    if (apiBtn) apiBtn.className = 'btn btn-secondary';
    if (mockBtn) mockBtn.className = 'btn btn-secondary';
    if (embeddedBtn) embeddedBtn.className = 'btn btn-secondary';
    
    if (mode === 'api') {
        if (apiContainer) apiContainer.style.display = 'block';
        if (apiBtn) apiBtn.className = 'btn btn-primary';
        
        // APIヘルスチェックを実行
        checkAPIHealth();
        
        // 結果をクリア
        const apiResults = document.getElementById('api-search-results');
        if (apiResults) {
            apiResults.innerHTML = `
                <div class="alert alert-info">
                    APIキーワードを入力して「API検索実行」ボタンを押してください。
                </div>
            `;
        }
    } else if (mode === 'mock') {
        if (mockContainer) mockContainer.style.display = 'block';
        if (mockBtn) mockBtn.className = 'btn btn-primary';
        
        // モック結果をクリア
        const searchResults = document.getElementById('search-results');
        const noSearch = document.getElementById('no-search');
        if (searchResults) searchResults.classList.add('hidden');
        if (noSearch) noSearch.classList.remove('hidden');
    } else if (mode === 'embedded') {
        if (streamlitContainer) streamlitContainer.style.display = 'block';
        if (embeddedBtn) embeddedBtn.className = 'btn btn-primary';
    }
}

// 研究者詳細表示（モック）
function showResearcherDetail(name) {
    alert(`${name}の詳細ページへ遷移します（API連携完了後に実装予定）`);
}

// プロジェクト候補追加
function addToProjectCandidates(name, affiliation = '', url = '') {
    // ローカルストレージから仮プロジェクト一覧を取得
    const tempProjects = JSON.parse(localStorage.getItem('tempProjects') || '[]');
    
    if (tempProjects.length === 0) {
        alert('まず仮プロジェクトを作成してください。');
        return;
    }
    
    // 最新の仮プロジェクトに追加
    const latestProject = tempProjects[tempProjects.length - 1];
    const researcher = { name, affiliation, url };
    
    // ローカルに追加
    if (!latestProject.selected_researchers) {
        latestProject.selected_researchers = [];
    }
    
    const exists = latestProject.selected_researchers.some(r => r.name === name);
    if (!exists) {
        latestProject.selected_researchers.push({
            ...researcher,
            added_at: new Date().toISOString()
        });
        localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
        alert(`${name}を「${latestProject.name}」に追加しました`);
    } else {
        alert('この研究者は既に追加されています');
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // デフォルトでAPI検索を表示
    toggleAPISearchMode('api');
    
    console.log('改良版APIクライアント初期化完了');
    console.log('現在のAPI URL:', apiClient.getCurrentApiUrl());
    
    // API URL検証状況をログ出力
    setTimeout(() => {
        if (typeof validatedApiUrl !== 'undefined' && validatedApiUrl) {
            console.log('✅ API URL検証完了:', validatedApiUrl);
        } else {
            console.log('⚠️ API URL未検証 - デフォルトURLを使用:', apiClient.getCurrentApiUrl());
        }
    }, 2000);
});
