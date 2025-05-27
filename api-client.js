// API設定とユーティリティ関数
class ResearcherSearchAPI {
    constructor() {
        // 環境に応じてAPIのベースURLを設定
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:8000'  // ローカル開発
            : 'https://web-production-ce1a5.up.railway.app/';  // 本番環境（後で実際のURLに更新）
        
        console.log('API Base URL:', this.baseURL);
    }

    // ヘルスチェック
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error', message: error.message };
        }
    }

    // 研究者検索（メイン機能）
    async searchResearchers(searchParams) {
        try {
            const {
                query,
                method = 'semantic',
                maxResults = 5,
                useLLMExpansion = false,
                useLLMSummary = false
            } = searchParams;

            // POSTリクエストでAPIを呼び出し
            const response = await fetch(`${this.baseURL}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    method: method,
                    max_results: maxResults,
                    use_llm_expansion: useLLMExpansion,
                    use_llm_summary: useLLMSummary
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API search error:', error);
            throw error;
        }
    }

    // GET版検索（テスト用）
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

            const response = await fetch(`${this.baseURL}/api/search?${params}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('API GET search error:', error);
            throw error;
        }
    }
}

// グローバルAPIクライアントインスタンス
const apiClient = new ResearcherSearchAPI();

// API検索結果の表示関数
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

// 実際のAPI検索関数
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
                API検索でエラーが発生しました: ${error.message}
                <br><small>バックエンドサーバーが起動しているか確認してください。</small>
            </div>
        `;
    }
}

// ヘルスチェック関数
async function checkAPIHealth() {
    try {
        const health = await apiClient.healthCheck();
        console.log('API Health:', health);
        
        const statusElement = document.getElementById('api-status');
        if (health.status === 'healthy') {
            statusElement.innerHTML = '🟢 API接続正常';
            statusElement.className = 'alert alert-success';
        } else {
            statusElement.innerHTML = '🟡 API接続に問題があります';
            statusElement.className = 'alert alert-warning';
        }
    } catch (error) {
        console.error('API Health Check Error:', error);
        const statusElement = document.getElementById('api-status');
        statusElement.innerHTML = '🔴 APIサーバーに接続できません';
        statusElement.className = 'alert alert-warning';
    }
}

// 検索方法の切り替え関数
function toggleAPISearchMode(mode) {
    const apiContainer = document.getElementById('api-container');
    const mockContainer = document.getElementById('mock-container');
    const streamlitContainer = document.getElementById('streamlit-container');
    const apiBtn = document.getElementById('api-btn');
    const mockBtn = document.getElementById('mock-btn');
    const embeddedBtn = document.getElementById('embedded-btn');
    
    // すべてのコンテナを非表示
    apiContainer.style.display = 'none';
    mockContainer.style.display = 'none';
    streamlitContainer.style.display = 'none';
    
    // すべてのボタンをセカンダリに
    apiBtn.className = 'btn btn-secondary';
    mockBtn.className = 'btn btn-secondary';
    embeddedBtn.className = 'btn btn-secondary';
    
    if (mode === 'api') {
        apiContainer.style.display = 'block';
        apiBtn.className = 'btn btn-primary';
        
        // APIヘルスチェックを実行
        checkAPIHealth();
        
        // 結果をクリア
        document.getElementById('api-search-results').innerHTML = `
            <div class="alert alert-info">
                APIキーワードを入力して「API検索実行」ボタンを押してください。
            </div>
        `;
    } else if (mode === 'mock') {
        mockContainer.style.display = 'block';
        mockBtn.className = 'btn btn-primary';
        
        // モック結果をクリア
        document.getElementById('search-results').classList.add('hidden');
        document.getElementById('no-search').classList.remove('hidden');
    } else if (mode === 'embedded') {
        streamlitContainer.style.display = 'block';
        embeddedBtn.className = 'btn btn-primary';
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
    
    console.log('APIクライアント初期化完了');
});
