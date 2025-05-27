// 本番環境対応の API クライアント
class ResearcherSearchAPI {
    constructor() {
        // 環境に応じてAPIのベースURLを設定
        this.baseURL = this.determineAPIBaseURL();
        
        console.log('🌐 API Base URL:', this.baseURL);
        console.log('🏠 Current hostname:', window.location.hostname);
        console.log('📍 Full URL:', window.location.href);
        
        // デバッグ情報を画面に表示
        this.showDebugInfo();
    }

    determineAPIBaseURL() {
        const hostname = window.location.hostname;
        
        // ローカル開発環境
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        
        // Vercel 本番環境
        if (hostname.includes('vercel.app')) {
            return 'https://researcher-search-app-production.up.railway.app'; // Railway APIサーバー
        }
        
        // その他の本番環境
        if (hostname !== '') {
            return 'https://researcher-search-app-production.up.railway.app'; // Railway APIサーバー
        }
        
        // ローカルファイル（file://）の場合
        return 'https://researcher-search-app-production.up.railway.app'; // Railway APIサーバー
    }

    // デバッグ情報を画面に表示
    showDebugInfo() {
        const debugInfo = `
            <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 12px;">
                <strong>🔧 Debug Info:</strong><br>
                API URL: ${this.baseURL}<br>
                Hostname: ${window.location.hostname}<br>
                Protocol: ${window.location.protocol}<br>
                Full URL: ${window.location.href}
            </div>
        `;
        
        // APIステータス要素に追加
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.innerHTML = debugInfo + statusElement.innerHTML;
            statusElement.style.display = 'block';
        }
    }

    // ヘルスチェック
    async healthCheck() {
        try {
            console.log('🔍 ヘルスチェック開始:', `${this.baseURL}/health`);
            
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });
            
            console.log('✅ ヘルスチェックレスポンス:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 ヘルスチェック結果:', data);
            return data;
            
        } catch (error) {
            console.error('❌ ヘルスチェック失敗:', error);
            
            return { 
                status: 'error', 
                message: error.message,
                details: {
                    name: error.name,
                    message: error.message,
                    url: `${this.baseURL}/health`,
                    baseURL: this.baseURL,
                    hostname: window.location.hostname
                },
                timestamp: new Date().toISOString()
            };
        }
    }

    // 簡易接続テスト
    async simpleConnectionTest() {
        try {
            console.log('🔍 簡易接続テスト開始:', `${this.baseURL}/`);
            
            const response = await fetch(`${this.baseURL}/`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(5000)
            });
            
            console.log('✅ 簡易接続テスト結果:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                return { status: 'success', data: data };
            } else {
                return { 
                    status: 'error', 
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    details: {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                        type: response.type
                    }
                };
            }
            
        } catch (error) {
            console.error('❌ 簡易接続テスト失敗:', error);
            
            return { 
                status: 'error', 
                message: error.message,
                details: {
                    name: error.name,
                    message: error.message,
                    baseURL: this.baseURL,
                    testURL: `${this.baseURL}/`
                }
            };
        }
    }

    // 研究者検索
    async searchResearchers(searchParams) {
        try {
            const response = await fetch(`${this.baseURL}/api/search`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParams),
                signal: AbortSignal.timeout(30000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('🔍 API検索エラー:', error);
            throw error;
        }
    }
}

// グローバルAPIクライアントインスタンス
const apiClient = new ResearcherSearchAPI();

// ヘルスチェック関数
async function checkAPIHealth() {
    try {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.style.display = 'block';
            statusElement.innerHTML += '<div style="color: blue;">🔄 API接続確認中...</div>';
        }
        
        console.log('🏥 ヘルスチェック開始...');
        
        const connectionTest = await apiClient.simpleConnectionTest();
        console.log('📊 簡易接続テスト結果:', connectionTest);
        
        const healthCheck = await apiClient.healthCheck();
        console.log('📊 ヘルスチェック結果:', healthCheck);
        
        if (statusElement) {
            let statusHTML = '';
            
            if (connectionTest.status === 'success' && healthCheck.status === 'healthy') {
                statusHTML = '<div style="color: green;">🟢 API接続正常 - サーバー稼働中</div>';
            } else if (connectionTest.status === 'success') {
                statusHTML = '<div style="color: orange;">🟡 基本接続は可能 - ヘルスチェックに問題あり</div>';
            } else {
                statusHTML = `<div style="color: red;">🔴 API接続失敗: ${connectionTest.message}</div>`;
            }
            
            statusElement.innerHTML += statusHTML;
        }
        
    } catch (error) {
        console.error('💥 ヘルスチェック中に予期しないエラー:', error);
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.innerHTML += `<div style="color: red;">💥 予期しないエラー: ${error.message}</div>`;
        }
    }
}

// その他の関数（既存のまま）
async function performAPISearch() {
    const searchInput = document.getElementById('api-search-input');
    const searchQuery = searchInput.value.trim();
    
    if (!searchQuery) {
        alert('検索キーワードを入力してください。');
        return;
    }

    const resultsContainer = document.getElementById('api-search-results');
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            API検索を実行中...
        </div>
    `;

    try {
        const searchParams = {
            query: searchQuery,
            method: document.getElementById('search-method').value,
            max_results: parseInt(document.getElementById('max-results').value),
            use_llm_expansion: document.getElementById('llm-expansion').checked,
            use_llm_summary: document.getElementById('llm-summary').checked
        };

        console.log('🔍 API検索テスト開始:', searchParams);
        const result = await apiClient.searchResearchers(searchParams);
        
        // 結果表示
        displaySearchResults(result);

    } catch (error) {
        console.error('🔍 API検索エラー:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <h4>❌ API検索エラー</h4>
                <p><strong>エラー内容:</strong> ${error.message}</p>
            </div>
        `;
    }
}

// 検索結果表示関数
function displaySearchResults(data) {
    const resultsContainer = document.getElementById('api-search-results');
    
    if (!data.results || data.results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <h4>ℹ️ 検索結果なし</h4>
                <p>「${data.query}」に一致する研究者が見つかりませんでした。</p>
            </div>
        `;
        return;
    }
    
    let resultsHTML = `
        <div class="search-results-header">
            <h3>🔍 「${data.query}」の${data.method === 'semantic' ? 'セマンティック' : 'キーワード'}検索結果</h3>
            <p>${data.total}件見つかりました（実行時間: ${data.execution_time.toFixed(2)}秒）</p>
            ${data.executed_query_info ? `<small>${data.executed_query_info}</small>` : ''}
        </div>
        <div class="results-list">
    `;

    data.results.forEach((researcher, index) => {
        resultsHTML += `
            <div class="researcher-card" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px;">
                <h4>📋 ${researcher.name_ja || researcher.name_en || '名前不明'}</h4>
                <p><strong>🏢 所属:</strong> ${researcher.main_affiliation_name_ja || researcher.main_affiliation_name_en || '不明'}</p>
                <p><strong>🔍 研究キーワード:</strong> ${researcher.research_keywords_ja || '不明'}</p>
                <p><strong>📚 研究分野:</strong> ${researcher.research_fields_ja || '不明'}</p>
                
                ${researcher.profile_ja ? `<p><strong>📝 プロフィール:</strong> ${researcher.profile_ja.substring(0, 200)}${researcher.profile_ja.length > 200 ? '...' : ''}</p>` : ''}
                
                ${researcher.paper_title_ja_first ? `<p><strong>📄 主要論文:</strong> ${researcher.paper_title_ja_first}</p>` : ''}
                ${researcher.project_title_ja_first ? `<p><strong>🎯 プロジェクト:</strong> ${researcher.project_title_ja_first}</p>` : ''}
                
                ${researcher.relevance_score ? `<p><strong>📊 関連度:</strong> ${researcher.relevance_score}</p>` : ''}
                ${researcher.distance ? `<p><strong>📏 距離スコア:</strong> ${researcher.distance.toFixed(4)}</p>` : ''}
                
                ${researcher.llm_summary ? `
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px;">
                        <strong>🤖 AI要約:</strong> ${researcher.llm_summary}
                    </div>
                ` : ''}
                
                ${researcher.researchmap_url ? `
                    <p><a href="${researcher.researchmap_url}" target="_blank" class="btn btn-sm btn-info">🔗 ResearchMap</a></p>
                ` : ''}
                
                <div style="margin-top: 10px;">
                    <button onclick="showResearcherDetail('${researcher.name_ja}')" class="btn btn-sm btn-info">詳細</button>
                    <button onclick="addToProjectCandidates('${researcher.name_ja}')" class="btn btn-sm btn-success">候補に追加</button>
                </div>
            </div>
        `;
    });

    resultsHTML += '</div>';
    resultsContainer.innerHTML = resultsHTML;
}

// その他の既存関数
function toggleAPISearchMode(mode) {
    const apiContainer = document.getElementById('api-container');
    const mockContainer = document.getElementById('mock-container');
    const streamlitContainer = document.getElementById('streamlit-container');
    const apiBtn = document.getElementById('api-btn');
    const mockBtn = document.getElementById('mock-btn');
    const embeddedBtn = document.getElementById('embedded-btn');
    
    if (apiContainer) apiContainer.style.display = 'none';
    if (mockContainer) mockContainer.style.display = 'none';
    if (streamlitContainer) streamlitContainer.style.display = 'none';
    
    if (apiBtn) apiBtn.className = 'btn btn-secondary';
    if (mockBtn) mockBtn.className = 'btn btn-secondary';
    if (embeddedBtn) embeddedBtn.className = 'btn btn-secondary';
    
    if (mode === 'api') {
        if (apiContainer) apiContainer.style.display = 'block';
        if (apiBtn) apiBtn.className = 'btn btn-primary';
        
        checkAPIHealth();
        
        const apiResults = document.getElementById('api-search-results');
        if (apiResults) {
            apiResults.innerHTML = `
                <div class="alert alert-info">
                    APIキーワードを入力して「API検索実行」ボタンを押してください。<br>
                    <small>※ 現在はモック検索が動作中。実際のデータベース検索は準備中です。</small>
                </div>
            `;
        }
    } else if (mode === 'mock') {
        if (mockContainer) mockContainer.style.display = 'block';
        if (mockBtn) mockBtn.className = 'btn btn-primary';
        
        const searchResults = document.getElementById('search-results');
        const noSearch = document.getElementById('no-search');
        if (searchResults) searchResults.classList.add('hidden');
        if (noSearch) noSearch.classList.remove('hidden');
    } else if (mode === 'embedded') {
        if (streamlitContainer) streamlitContainer.style.display = 'block';
        if (embeddedBtn) embeddedBtn.className = 'btn btn-primary';
    }
}

function showResearcherDetail(name) {
    alert(`${name}の詳細ページへ遷移します（詳細画面は今後実装予定）`);
}

function addToProjectCandidates(name) {
    alert(`${name}をプロジェクト候補に追加しました。`);
}

document.addEventListener('DOMContentLoaded', function() {
    // デフォルトでAPIモードを表示
    toggleAPISearchMode('api');
    console.log('🚀 本番環境対応APIクライアント初期化完了');
});
