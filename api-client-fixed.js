// 修正版 API クライアント - Railway URL自動検出機能付き
class ResearcherSearchAPI {
    constructor() {
        this.possibleAPIURLs = this.getPossibleAPIURLs();
        this.baseURL = null;
        this.isInitialized = false;
        
        console.log('🔍 API URL候補:', this.possibleAPIURLs);
        
        // 初期化を実行
        this.initialize();
    }

    // 可能性のあるAPI URLリストを生成
    getPossibleAPIURLs() {
        const hostname = window.location.hostname;
        
        // ローカル開発環境
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return ['http://localhost:8000'];
        }
        
        // 本番環境での可能性のあるRailway URL
        return [
            // Railway の一般的なURL形式
            'https://web-production-xxxx.up.railway.app',
            'https://researcher-search-app-production.up.railway.app',
            'https://researcher-api-production.up.railway.app',
            'https://api-production-xxxx.up.railway.app',
            
            // 実際にユーザーが設定するURL（後で置き換える）
            'https://YOUR_RAILWAY_URL_HERE.up.railway.app'
        ];
    }

    // API URLを自動検出して初期化
    async initialize() {
        console.log('🚀 API初期化開始...');
        
        for (const url of this.possibleAPIURLs) {
            if (url.includes('YOUR_RAILWAY_URL_HERE')) {
                continue; // プレースホルダーはスキップ
            }
            
            console.log(`🔍 テスト中: ${url}`);
            
            if (await this.testConnection(url)) {
                this.baseURL = url;
                this.isInitialized = true;
                console.log(`✅ API URL確定: ${url}`);
                this.showSuccessMessage();
                return;
            }
        }
        
        // すべて失敗した場合
        console.log('❌ 有効なAPI URLが見つかりませんでした');
        this.showManualSetupMessage();
    }

    // 接続テスト
    async testConnection(url) {
        try {
            const response = await fetch(`${url}/`, {
                method: 'GET',
                mode: 'cors',
                signal: AbortSignal.timeout(5000)
            });
            
            return response.ok;
        } catch (error) {
            console.log(`❌ ${url} 接続失敗:`, error.message);
            return false;
        }
    }

    // 成功メッセージを表示
    showSuccessMessage() {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4>✅ API接続成功！</h4>
                    <p><strong>接続先:</strong> ${this.baseURL}</p>
                    <p>バックエンドAPIとの通信が確立されました。実際の検索機能を使用できます。</p>
                </div>
            `;
            statusElement.style.display = 'block';
        }
    }

    // 手動設定メッセージを表示
    showManualSetupMessage() {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4>⚙️ API URL手動設定が必要です</h4>
                    <p>自動検出に失敗しました。以下の手順でAPIのURLを設定してください：</p>
                    <ol>
                        <li>Railway管理画面でバックエンドAPIのURLを確認</li>
                        <li>以下の入力欄にURLを入力</li>
                        <li>「接続テスト」ボタンを押して確認</li>
                    </ol>
                    <div style="margin-top: 15px;">
                        <input type="text" id="manual-api-url" placeholder="https://your-railway-url.up.railway.app" 
                               style="width: 300px; padding: 8px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        <button onclick="apiClient.setManualURL()" class="btn btn-primary">接続テスト</button>
                    </div>
                </div>
            `;
            statusElement.style.display = 'block';
        }
    }

    // 手動URL設定
    async setManualURL() {
        const urlInput = document.getElementById('manual-api-url');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('URLを入力してください');
            return;
        }
        
        console.log(`🔍 手動URL接続テスト: ${url}`);
        
        if (await this.testConnection(url)) {
            this.baseURL = url;
            this.isInitialized = true;
            console.log(`✅ 手動設定成功: ${url}`);
            this.showSuccessMessage();
        } else {
            alert(`接続に失敗しました: ${url}\\n\\nURLが正しいか確認してください。`);
        }
    }

    // API準備状況チェック
    ensureInitialized() {
        if (!this.isInitialized || !this.baseURL) {
            throw new Error('API URL が設定されていません。先に接続を確立してください。');
        }
    }

    // ヘルスチェック
    async healthCheck() {
        try {
            this.ensureInitialized();
            
            console.log('🔍 ヘルスチェック開始:', `${this.baseURL}/health`);
            
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });
            
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
                timestamp: new Date().toISOString()
            };
        }
    }

    // 研究者検索
    async searchResearchers(searchParams) {
        try {
            this.ensureInitialized();

            const {
                query,
                method = 'semantic',
                maxResults = 5,
                useLLMExpansion = false,
                useLLMSummary = false
            } = searchParams;

            console.log('🔍 API検索開始:', searchParams);

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
                signal: AbortSignal.timeout(30000)
            });

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
            console.log('✅ API検索成功:', data);
            return data;

        } catch (error) {
            console.error('❌ API検索エラー:', error);
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

// API検索実行関数
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

        console.log('🔍 API検索開始:', searchParams);
        const apiResponse = await apiClient.searchResearchers(searchParams);
        console.log('✅ API検索結果:', apiResponse);

        // 結果表示
        displayAPISearchResults(apiResponse);

    } catch (error) {
        console.error('❌ API検索エラー:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-warning">
                <h4>🔴 API検索でエラーが発生しました</h4>
                <p><strong>エラー内容:</strong> ${error.message}</p>
                <hr>
                <h5>🔧 対処方法:</h5>
                <ul>
                    <li>APIサーバーのURLが正しく設定されているか確認してください</li>
                    <li>Railway管理画面でバックエンドサーバーが稼働中か確認してください</li>
                    <li>しばらく待ってから再試行してください</li>
                </ul>
            </div>
        `;
    }
}

// ヘルスチェック関数
async function checkAPIHealth() {
    try {
        const statusElement = document.getElementById('api-status');
        
        if (!apiClient.isInitialized) {
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="alert alert-warning">
                        API接続が初期化されていません。画面の指示に従ってAPIのURLを設定してください。
                    </div>
                `;
                statusElement.style.display = 'block';
            }
            return;
        }
        
        const healthCheck = await apiClient.healthCheck();
        console.log('📊 ヘルスチェック結果:', healthCheck);
        
        if (statusElement) {
            if (healthCheck.status === 'healthy') {
                statusElement.innerHTML += `
                    <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin: 10px 0;">
                        🟢 APIヘルスチェック正常 - 全機能利用可能
                    </div>
                `;
            } else {
                statusElement.innerHTML += `
                    <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; margin: 10px 0;">
                        🟡 API接続可能 - 一部機能に制限があります
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('💥 ヘルスチェックエラー:', error);
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.innerHTML += `
                <div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin: 10px 0;">
                    🔴 APIヘルスチェック失敗: ${error.message}
                </div>
            `;
        }
    }
}

// その他の関数
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
        
        // 初期化状況をチェック
        setTimeout(() => {
            if (apiClient.isInitialized) {
                checkAPIHealth();
            }
        }, 1000);
        
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
    
    console.log('🚀 修正版APIクライアント初期化完了');
    console.log('📍 初期化後の状態:', {
        isInitialized: apiClient.isInitialized,
        baseURL: apiClient.baseURL
    });
});
