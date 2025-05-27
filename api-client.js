// 改良されたAPI設定とユーティリティ関数
class ResearcherSearchAPI {
    constructor() {
        // 環境に応じてAPIのベースURLを設定
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:8000'  // ローカル開発
            : 'https://【実際のRailway URLをここに入力】';  // 本番環境
        
        console.log('API Base URL:', this.baseURL);
        console.log('Current hostname:', window.location.hostname);
    }

    // ヘルスチェック（改良版）
    async healthCheck() {
        try {
            console.log('ヘルスチェック開始:', `${this.baseURL}/health`);
            
            const response = await fetch(`${this.baseURL}/health`, {
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
                url: `${this.baseURL}/health`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 簡易接続テスト
    async simpleConnectionTest() {
        try {
            console.log('簡易接続テスト開始:', `${this.baseURL}/`);
            
            const response = await fetch(`${this.baseURL}/`, {
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

            console.log('API検索開始:', searchParams);
            console.log('リクエストURL:', `${this.baseURL}/api/search`);

            // POSTリクエストでAPIを呼び出し
            const response = await fetch(`${this.baseURL}/api/search`, {
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
                    use_llm_summary: useLLMSummary
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

            console.log('GET検索開始:', `${this.baseURL}/api/search?${params}`);

            const response = await fetch(`${this.baseURL}/api/search?${params}`, {
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
}

// グローバルAPIクライアントインスタンス
const apiClient = new ResearcherSearchAPI();

// API検索結果の表示関数（変更なし）
function displayAPISearchResults(apiResponse) {
    const resultsContainer = document.getElementById('api-search-results');
    
    if (!apiResponse || apiResponse.status !== 'success') {
        resultsContainer.innerHTML = `
            <div class="alert alert-warning">
                API検索でエラーが発生しました: ${apiResponse?.detail || '不明なエラー'}
            </div>
        `;
        return;
    }

    if (!apiResponse.results || apiResponse.results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                「${apiResponse.query}」に該当する研究者は見つかりませんでした。
            </div>
        `;
        return;
    }

    // 成功メッセージ
    let html = `
        <div class="alert alert-success">
            「${apiResponse.query}」の${apiResponse.method === 'semantic' ? 'セマンティック' : 'キーワード'}検索結果: 
            ${apiResponse.total}件見つかりました。
            <small>(実行時間: ${apiResponse.execution_time.toFixed(2)}秒)</small>
        </div>
    `;

    // 実行情報の表示
    if (apiResponse.executed_query_info) {
        html += `
            <div class="alert alert-info" style="font-size: 0.9em;">
                <strong>実行情報:</strong> ${apiResponse.executed_query_info}
            </div>
        `;
    }

    // 研究者カードの生成
    apiResponse.results.forEach((researcher, index) => {
        const name = researcher.name_ja || researcher.name_en || '名前不明';
        const affiliation = researcher.main_affiliation_name_ja || researcher.main_affiliation_name_en || '所属不明';
        const keywords = researcher.research_keywords_ja || 'N/A';
        const fields = researcher.research_fields_ja || 'N/A';
        const profile = researcher.profile_ja || 'N/A';
        const paper = researcher.paper_title_ja_first || 'N/A';
        const project = researcher.project_title_ja_first || 'N/A';
        const researchmapUrl = researcher.researchmap_url || '#';

        // スコア表示
        let scoreText = '';
        if (apiResponse.method === 'keyword' && researcher.relevance_score !== null) {
            scoreText = ` (関連度: ${researcher.relevance_score})`;
        } else if (apiResponse.method === 'semantic' && researcher.distance !== null) {
            scoreText = ` (距離: ${researcher.distance.toFixed(4)})`;
        }

        html += `
            <div class="researcher-card">
                <div class="researcher-name">${name} (${affiliation})${scoreText}</div>
                
                ${keywords !== 'N/A' ? `<div class="researcher-info"><span class="info-label">研究キーワード:</span> ${keywords}</div>` : ''}
                ${fields !== 'N/A' ? `<div class="researcher-info"><span class="info-label">研究分野:</span> ${fields}</div>` : ''}
                ${profile !== 'N/A' ? `<div class="researcher-info"><span class="info-label">プロフィール:</span> ${profile.length > 200 ? profile.substring(0, 200) + '...' : profile}</div>` : ''}
                ${paper !== 'N/A' ? `<div class="researcher-info"><span class="info-label">主要論文:</span> ${paper}</div>` : ''}
                ${project !== 'N/A' ? `<div class="researcher-info"><span class="info-label">主要プロジェクト:</span> ${project}</div>` : ''}
                
                ${researcher.llm_summary ? `
                    <div class="ai-summary">
                        <strong>AI関連性分析:</strong> ${researcher.llm_summary}
                    </div>
                ` : ''}
                
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="showResearcherDetail('${name}')">詳細を見る</button>
                    <button class="btn btn-primary" onclick="addToProjectCandidates('${name}')">プロジェクト候補に追加</button>
                    ${researchmapUrl !== '#' ? `<a href="${researchmapUrl}" target="_blank" class="btn btn-secondary">ResearchMap</a>` : ''}
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

// 実際のAPI検索関数（変更なし）
async function performAPISearch() {
    const searchInput = document.getElementById('api-search-input');
    const searchQuery = searchInput.value.trim();
    
    if (!searchQuery) {
        alert('検索キーワードを入力してください。');
        return;
    }

    // 検索オプションの取得
    const searchMethod = document.getElementById('search-method').value;
    const maxResults = parseInt(document.getElementById('max-results').value);
    const useLLMExpansion = document.getElementById('llm-expansion').checked;
    const useLLMSummary = document.getElementById('llm-summary').checked;

    // 結果エリアをクリア
    const resultsContainer = document.getElementById('api-search-results');
    
    // ローディング表示
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            API検索を実行中...
        </div>
    `;

    try {
        // API検索実行
        const searchParams = {
            query: searchQuery,
            method: searchMethod,
            maxResults: maxResults,
            useLLMExpansion: useLLMExpansion,
            useLLMSummary: useLLMSummary
        };

        console.log('API検索開始:', searchParams);
        const apiResponse = await apiClient.searchResearchers(searchParams);
        console.log('API検索結果:', apiResponse);

        // 結果表示
        displayAPISearchResults(apiResponse);

    } catch (error) {
        console.error('API検索エラー:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-warning">
                <h4>🔴 API検索でエラーが発生しました</h4>
                <p><strong>エラー内容:</strong> ${error.message}</p>
                <hr>
                <h5>🔧 トラブルシューティング:</h5>
                <ul>
                    <li>📡 <strong>接続テスト:</strong> <button class="btn btn-secondary" onclick="performConnectionDiagnostic()">診断実行</button></li>
                    <li>🔄 しばらく待ってから再試行してください</li>
                    <li>📝 Railway管理画面でサーバーの状態を確認してください</li>
                    <li>🌐 ネットワーク接続を確認してください</li>
                </ul>
            </div>
        `;
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
            <p><strong>API URL:</strong> ${apiClient.baseURL}</p>
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

// プロジェクト候補追加（モック）
function addToProjectCandidates(name) {
    alert(`${name}をプロジェクト候補に追加しました。`);
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // デフォルトでAPI検索を表示
    toggleAPISearchMode('api');
    
    console.log('改良版APIクライアント初期化完了');
    console.log('現在のAPI URL:', apiClient.baseURL);
});
