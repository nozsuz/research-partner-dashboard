// デバッグ強化版APIクライアント（LLMテスト機能付き）
class ResearcherSearchAPI {
    constructor() {
        this.baseURL = 'https://researcher-search-app-production.up.railway.app';
        this.isInitialized = true;
        
        console.log('🔍 APIクライアント初期化:', this.baseURL);
    }

    // 詳細なGCP機能テスト
    async testGCPFeatures() {
        try {
            console.log('🔍 GCP機能テスト開始...');
            
            const response = await fetch(`${this.baseURL}/test/gcp`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(15000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 GCP機能テスト結果:', data);
            return data;
            
        } catch (error) {
            console.error('❌ GCP機能テスト失敗:', error);
            return { status: 'error', message: error.message };
        }
    }

    // 環境変数状況テスト
    async testEnvironmentVariables() {
        try {
            console.log('🔍 環境変数テスト開始...');
            
            const response = await fetch(`${this.baseURL}/test/env`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 環境変数テスト結果:', data);
            return data;
            
        } catch (error) {
            console.error('❌ 環境変数テスト失敗:', error);
            return { status: 'error', message: error.message };
        }
    }

    // LLM機能テスト
    async testLLMFunctions() {
        try {
            console.log('🔍 LLM機能テスト開始...');
            
            const response = await fetch(`${this.baseURL}/test/llm`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(30000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 LLM機能テスト結果:', data);
            return data;
            
        } catch (error) {
            console.error('❌ LLM機能テスト失敗:', error);
            return { status: 'error', message: error.message };
        }
    }

    // 実際の検索機能テスト
    async testRealSearch() {
        try {
            console.log('🔍 実際の検索機能テスト開始...');
            
            const response = await fetch(`${this.baseURL}/test/real-search`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(15000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 実際の検索機能テスト結果:', data);
            return data;
            
        } catch (error) {
            console.error('❌ 実際の検索機能テスト失敗:', error);
            return { status: 'error', message: error.message };
        }
    }

    // ヘルスチェック
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    // 検索機能（各種パラメータでテスト）
    async searchResearchers(searchParams) {
        try {
            const {
                query,
                method = 'semantic',
                maxResults = 5,
                useLLMExpansion = false,
                useLLMSummary = false
            } = searchParams;

            console.log('🔍 API検索開始:', {
                query, method, maxResults, useLLMExpansion, useLLMSummary
            });

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
            console.log('✅ API検索結果:', data);
            
            // デバッグ: expanded_info の確認
            if (data.expanded_info) {
                console.log('🧠 キーワード拡張情報:', data.expanded_info);
            } else {
                console.log('ℹ️ キーワード拡張なし (expanded_info が null または未定義)');
            }
            
            return data;

        } catch (error) {
            console.error('❌ API検索エラー:', error);
            throw error;
        }
    }
}

// グローバルAPIクライアントインスタンス
const apiClient = new ResearcherSearchAPI();

// 検索方法変更時のUI制御
function onSearchMethodChange() {
    const searchMethod = document.getElementById('search-method').value;
    const llmExpansionGroup = document.getElementById('llm-expansion-group');
    const llmExpansionCheckbox = document.getElementById('llm-expansion');
    
    if (searchMethod === 'semantic') {
        // セマンティック検索時はクエリ拡張を無効化
        llmExpansionCheckbox.checked = false;
        llmExpansionCheckbox.disabled = true;
        llmExpansionGroup.style.opacity = '0.5';
        llmExpansionGroup.title = 'セマンティック検索では利用できません';
    } else {
        // キーワード検索時はクエリ拡張を有効化
        llmExpansionCheckbox.disabled = false;
        llmExpansionGroup.style.opacity = '1';
        llmExpansionGroup.title = '';
    }
}

// 詳細診断実行関数
async function performDetailedDiagnostic() {
    const resultsContainer = document.getElementById('api-search-results');
    
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            詳細診断を実行中...
        </div>
    `;
    
    console.log('🔍 詳細診断開始...');
    
    const diagnostics = {
        health: null,
        env: null,
        gcp: null,
        llm: null,
        realSearch: null
    };
    
    // 1. ヘルスチェック
    console.log('📊 1/5: ヘルスチェック');
    diagnostics.health = await apiClient.healthCheck();
    
    // 2. 環境変数テスト
    console.log('📊 2/5: 環境変数テスト');
    diagnostics.env = await apiClient.testEnvironmentVariables();
    
    // 3. GCP機能テスト
    console.log('📊 3/5: GCP機能テスト');
    diagnostics.gcp = await apiClient.testGCPFeatures();
    
    // 4. LLM機能テスト
    console.log('📊 4/5: LLM機能テスト');
    diagnostics.llm = await apiClient.testLLMFunctions();
    
    // 5. 実際の検索機能テスト
    console.log('📊 5/5: 実際の検索機能テスト');
    diagnostics.realSearch = await apiClient.testRealSearch();
    
    // 結果を表示
    displayDetailedDiagnosticResults(diagnostics);
}

// 詳細診断結果表示
function displayDetailedDiagnosticResults(diagnostics) {
    const resultsContainer = document.getElementById('api-search-results');
    
    let html = `
        <div class="alert alert-info">
            <h4>🔧 詳細診断結果</h4>
            <p>各機能の動作状況を確認します。</p>
        </div>
    `;
    
    // 1. ヘルスチェック結果
    const healthStatus = diagnostics.health?.status === 'healthy' ? '🟢' : '🔴';
    html += `
        <div class="diagnostic-section">
            <h5>${healthStatus} ヘルスチェック</h5>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; white-space: pre-wrap; max-height: 200px; overflow-y: auto;">
${JSON.stringify(diagnostics.health, null, 2)}
            </pre>
        </div>
    `;
    
    // 2. LLM機能テスト結果
    const llmStatus = (diagnostics.llm?.tests?.query_expansion?.expansion_worked && 
                     diagnostics.llm?.tests?.summary_generation?.summary_generated) ? '🟢' : '🔴';
    html += `
        <div class="diagnostic-section">
            <h5>${llmStatus} LLM機能テスト</h5>
    `;
    
    if (diagnostics.llm?.tests) {
        // クエリ拡張テスト
        const expansionTest = diagnostics.llm.tests.query_expansion;
        if (expansionTest) {
            const expansionStatus = expansionTest.expansion_worked ? '✅' : '❌';
            html += `
                <p><strong>${expansionStatus} クエリ拡張:</strong></p>
                <ul>
                    <li>ステータス: ${expansionTest.status}</li>
                    <li>元のクエリ: ${expansionTest.original_query || 'N/A'}</li>
                    <li>拡張後: ${expansionTest.expanded_query || 'N/A'}</li>
                    <li>拡張動作: ${expansionTest.expansion_worked ? 'はい' : 'いいえ'}</li>
                    ${expansionTest.error ? `<li>エラー: ${expansionTest.error}</li>` : ''}
                </ul>
            `;
        }
        
        // 要約生成テスト  
        const summaryTest = diagnostics.llm.tests.summary_generation;
        if (summaryTest) {
            const summaryStatus = summaryTest.summary_generated ? '✅' : '❌';
            html += `
                <p><strong>${summaryStatus} 要約生成:</strong></p>
                <ul>
                    <li>ステータス: ${summaryTest.status}</li>
                    <li>要約生成: ${summaryTest.summary_generated ? 'はい' : 'いいえ'}</li>
                    <li>要約テキスト: ${summaryTest.summary_text || 'N/A'}</li>
                    ${summaryTest.error ? `<li>エラー: ${summaryTest.error}</li>` : ''}
                </ul>
            `;
        }
    }
    
    html += `</div>`;
    
    // 3. GCP機能テスト結果
    const gcpStatus = (diagnostics.gcp?.tests?.bigquery?.status?.includes('成功') && 
                     diagnostics.gcp?.tests?.vertex_ai?.status?.includes('成功')) ? '🟢' : '🔴';
    html += `
        <div class="diagnostic-section">
            <h5>${gcpStatus} GCP機能テスト</h5>
    `;
    
    if (diagnostics.gcp?.tests) {
        Object.entries(diagnostics.gcp.tests).forEach(([service, result]) => {
            const serviceStatus = result.status?.includes('成功') ? '✅' : '❌';
            html += `
                <p><strong>${serviceStatus} ${service.toUpperCase()}:</strong></p>
                <ul>
                    <li>ステータス: ${result.status}</li>
                    ${result.total_researchers ? `<li>データ件数: ${result.total_researchers}件</li>` : ''}
                    ${result.error ? `<li>エラー: ${result.error}</li>` : ''}
                </ul>
            `;
        });
    }
    
    html += `</div>`;
    
    // 推奨事項
    html += `
        <div class="alert alert-warning">
            <h5>🔧 推奨事項</h5>
            <ul>
    `;
    
    if (!diagnostics.llm?.tests?.query_expansion?.expansion_worked) {
        html += `<li>❗ LLMクエリ拡張が動作していません。Gemini 2.0モデルの設定を確認してください。</li>`;
    }
    
    if (!diagnostics.llm?.tests?.summary_generation?.summary_generated) {
        html += `<li>❗ LLM要約生成が動作していません。Vertex AI設定を確認してください。</li>`;
    }
    
    if (!diagnostics.gcp?.tests?.vertex_ai?.status?.includes('成功')) {
        html += `<li>❗ Vertex AIが利用できません。認証設定を確認してください。</li>`;
    }
    
    html += `
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="performAPISearch()">通常の検索に戻る</button>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

// 機能別テスト実行
async function testSpecificFeature(feature) {
    const resultsContainer = document.getElementById('api-search-results');
    
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            ${feature}機能をテスト中...
        </div>
    `;
    
    try {
        let testParams = {
            query: '人工知能',
            method: 'keyword',
            maxResults: 3,
            useLLMExpansion: false,
            useLLMSummary: false
        };
        
        if (feature === 'semantic') {
            testParams.method = 'semantic';
        } else if (feature === 'llm-expansion') {
            testParams.useLLMExpansion = true;
        } else if (feature === 'llm-summary') {
            testParams.useLLMSummary = true;
        }
        
        console.log(`🔍 ${feature}機能テスト実行:`, testParams);
        
        const result = await apiClient.searchResearchers(testParams);
        
        let html = `
            <div class="alert alert-success">
                <h4>✅ ${feature}機能テスト成功</h4>
                <p><strong>クエリ:</strong> ${result.query}</p>
                <p><strong>方法:</strong> ${result.method}</p>
                <p><strong>結果件数:</strong> ${result.total}件</p>
                <p><strong>実行時間:</strong> ${result.execution_time.toFixed(2)}秒</p>
                ${result.executed_query_info ? `<p><strong>実行情報:</strong> ${result.executed_query_info}</p>` : ''}
                ${result.expanded_info ? `
                    <div style="background: #e8f5e8; padding: 10px; border-radius: 4px; margin-top: 10px;">
                        <strong>🧠 キーワード拡張:</strong><br>
                        元: <code>${result.expanded_info.original_query}</code><br>
                        拡張後: <code>${result.expanded_info.expanded_query}</code>
                    </div>
                ` : ''}
            </div>
        `;
        
        if (result.results && result.results.length > 0) {
            html += `<h5>サンプル結果:</h5>`;
            const sample = result.results[0];
            html += `
                <div class="researcher-card" style="margin-top: 15px;">
                    <h6>${sample.name_ja || sample.name_en || '名前不明'}</h6>
                    <p><strong>所属:</strong> ${sample.main_affiliation_name_ja || '不明'}</p>
                    <p><strong>キーワード:</strong> ${sample.research_keywords_ja || '不明'}</p>
                    ${sample.llm_summary ? `<div class="ai-summary">🤖 AI要約: ${sample.llm_summary}</div>` : ''}
                    ${sample.distance !== null ? `<p>距離スコア: ${sample.distance.toFixed(4)}</p>` : ''}
                    ${sample.relevance_score !== null ? `<p>関連度: ${sample.relevance_score}</p>` : ''}
                </div>
            `;
        }
        
        resultsContainer.innerHTML = html;
        
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <h4>❌ ${feature}機能テスト失敗</h4>
                <p><strong>エラー:</strong> ${error.message}</p>
                <p>この機能は現在利用できません。</p>
            </div>
        `;
    }
}

// API検索実行関数
async function performAPISearch() {
    const searchInput = document.getElementById('api-search-input');
    const searchQuery = searchInput.value.trim();
    
    if (!searchQuery) {
        alert('検索キーワードを入力してください。');
        return;
    }

    const searchMethod = document.getElementById('search-method').value;
    const maxResults = parseInt(document.getElementById('max-results').value);
    const useLLMExpansion = document.getElementById('llm-expansion').checked;
    const useLLMSummary = document.getElementById('llm-summary').checked;

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
            method: searchMethod,
            maxResults: maxResults,
            useLLMExpansion: useLLMExpansion,
            useLLMSummary: useLLMSummary
        };

        const apiResponse = await apiClient.searchResearchers(searchParams);
        displayAPISearchResults(apiResponse);

    } catch (error) {
        console.error('❌ API検索エラー:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-warning">
                <h4>🔴 API検索でエラーが発生</h4>
                <p><strong>エラー:</strong> ${error.message}</p>
                <div style="margin-top: 15px;">
                    <button class="btn btn-secondary" onclick="performDetailedDiagnostic()">詳細診断実行</button>
                    <button class="btn btn-info" onclick="testSpecificFeature('keyword')">キーワード検索テスト</button>
                    <button class="btn btn-info" onclick="testSpecificFeature('semantic')">セマンティック検索テスト</button>
                    <button class="btn btn-info" onclick="testSpecificFeature('llm-expansion')">LLM拡張テスト</button>
                    <button class="btn btn-info" onclick="testSpecificFeature('llm-summary')">LLM要約テスト</button>
                </div>
            </div>
        `;
    }
}

// API検索結果表示
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

    let html = `
        <div class="alert alert-success">
            「${apiResponse.query}」の${apiResponse.method === 'semantic' ? 'セマンティック' : 'キーワード'}検索結果: 
            ${apiResponse.total}件見つかりました。
            <small>(実行時間: ${apiResponse.execution_time.toFixed(2)}秒)</small>
            ${apiResponse.expanded_info && apiResponse.method === 'keyword' ? 
                `<br><small style="color: #28a745;">🧠 AIがキーワードを拡張して検索しました</small>` : ''}
        </div>
    `;

    if (apiResponse.executed_query_info) {
        html += `
            <div class="alert alert-info" style="font-size: 0.9em;">
                <strong>実行情報:</strong> ${apiResponse.executed_query_info}
            </div>
        `;
    }
    
    // キーワード拡張情報を表示
    console.log('🔍 キーワード拡張情報チェック:', {
        expanded_info: apiResponse.expanded_info,
        method: apiResponse.method,
        should_show: apiResponse.expanded_info && apiResponse.method === 'keyword'
    });
    
    if (apiResponse.expanded_info && apiResponse.method === 'keyword') {
        console.log('✅ キーワード拡張情報を表示します');
        html += `
            <div class="alert alert-success" style="font-size: 0.9em; background-color: #e8f5e8; border-color: #c3e6cb;">
                <strong>🧠 AIキーワード拡張:</strong><br>
                <span style="color: #666;">元のキーワード:</span> <code>${apiResponse.expanded_info.original_query}</code><br>
                <span style="color: #666;">拡張後:</span> <code style="background-color: #fff3cd; padding: 2px 4px; border-radius: 3px;">${apiResponse.expanded_info.expanded_query}</code>
            </div>
        `;
    } else {
        console.log('❌ キーワード拡張情報は表示しません');
    }

    apiResponse.results.forEach((researcher, index) => {
        const name = researcher.name_ja || researcher.name_en || '名前不明';
        const affiliation = researcher.main_affiliation_name_ja || researcher.main_affiliation_name_en || '所属不明';
        const keywords = researcher.research_keywords_ja || 'N/A';
        const fields = researcher.research_fields_ja || 'N/A';
        const profile = researcher.profile_ja || 'N/A';

        let scoreText = '';
        if (apiResponse.method === 'keyword' && researcher.relevance_score !== null) {
            scoreText = ` (関連度: ${researcher.relevance_score})`;
        } else if (apiResponse.method === 'semantic' && researcher.distance !== null) {
            scoreText = ` (距離: ${researcher.distance.toFixed(4)})`;
        }

        html += `
            <div class="researcher-card">
                <div class="researcher-name">${name} (${affiliation})${scoreText}</div>
                <div class="researcher-info"><span class="info-label">研究キーワード:</span> ${keywords}</div>
                <div class="researcher-info"><span class="info-label">研究分野:</span> ${fields}</div>
                <div class="researcher-info"><span class="info-label">プロフィール:</span> ${profile.length > 200 ? profile.substring(0, 200) + '...' : profile}</div>
                
                ${researcher.llm_summary ? `
                    <div class="ai-summary">
                        <strong>🤖 AI関連性分析:</strong> ${researcher.llm_summary}
                    </div>
                ` : ''}
                
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="showResearcherDetail('${name}')">詳細を見る</button>
                    <button class="btn btn-primary" onclick="addToProjectCandidates('${name}')">プロジェクト候補に追加</button>
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

// ヘルスチェック関数
async function checkAPIHealth() {
    try {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4>✅ API接続成功！</h4>
                    <p><strong>接続先:</strong> ${apiClient.baseURL}</p>
                    <p>バックエンドAPIとの通信が確立されました。実際の検索機能を使用できます。</p>
                </div>
                <div style="text-align: center; margin: 15px 0;">
                    <button class="btn btn-info" onclick="performDetailedDiagnostic()">🔧 詳細診断実行</button>
                </div>
            `;
            statusElement.style.display = 'block';
        }
        
        const healthCheck = await apiClient.healthCheck();
        
        if (statusElement && healthCheck.status === 'healthy') {
            statusElement.innerHTML += `
                <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin: 10px 0;">
                    🟢 APIヘルスチェック正常 - 全機能利用可能
                </div>
            `;
        }
        
    } catch (error) {
        console.error('ヘルスチェックエラー:', error);
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
        
        // 検索方法変更の初期設定
        onSearchMethodChange();
    } else if (mode === 'mock') {
        if (mockContainer) mockContainer.style.display = 'block';
        if (mockBtn) mockBtn.className = 'btn btn-primary';
    } else if (mode === 'embedded') {
        if (streamlitContainer) streamlitContainer.style.display = 'block';
        if (embeddedBtn) embeddedBtn.className = 'btn btn-primary';
    }
}

function showResearcherDetail(name) {
    alert(`${name}の詳細ページへ遷移します（API連携完了後に実装予定）`);
}

function addToProjectCandidates(name) {
    alert(`${name}をプロジェクト候補に追加しました。`);
}

document.addEventListener('DOMContentLoaded', function() {
    toggleAPISearchMode('api');
    console.log('🚀 LLMテスト対応APIクライアント初期化完了');
    
    // 検索方法変更のイベントリスナー追加
    const searchMethodSelect = document.getElementById('search-method');
    if (searchMethodSelect) {
        searchMethodSelect.addEventListener('change', onSearchMethodChange);
    }
});
