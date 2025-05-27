// デバッグ用の詳細検索関数
async function performAPISearchDebug() {
    const searchInput = document.getElementById('api-search-input');
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    
    console.log('🔍 デバッグ: 検索開始');
    console.log('🔍 検索クエリ:', searchQuery);
    console.log('🔍 API Base URL:', apiClient.baseURL);
    
    if (!searchQuery) {
        alert('検索キーワードを入力してください。');
        return;
    }

    const resultsContainer = document.getElementById('api-search-results');
    if (!resultsContainer) {
        console.error('❌ api-search-results 要素が見つかりません');
        alert('検索結果表示エリアが見つかりません');
        return;
    }

    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            🔄 API検索を実行中...
        </div>
    `;

    try {
        // 検索パラメータを準備
        const searchParams = {
            query: searchQuery,
            method: document.getElementById('search-method') ? document.getElementById('search-method').value : 'semantic',
            maxResults: document.getElementById('max-results') ? parseInt(document.getElementById('max-results').value) : 5,
            useLLMExpansion: document.getElementById('llm-expansion') ? document.getElementById('llm-expansion').checked : false,
            useLLMSummary: document.getElementById('llm-summary') ? document.getElementById('llm-summary').checked : false
        };

        console.log('🔍 検索パラメータ:', searchParams);

        // APIエンドポイントURL
        const apiUrl = `${apiClient.baseURL}/api/search`;
        console.log('🔍 リクエストURL:', apiUrl);

        // POSTリクエスト送信
        console.log('🔍 POSTリクエスト送信開始...');
        const response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParams),
            signal: AbortSignal.timeout(30000)
        });

        console.log('✅ レスポンス受信:', response.status, response.statusText);
        console.log('🌐 Response Headers:', [...response.headers.entries()]);
        console.log('🔗 Response URL:', response.url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 検索結果データ:', data);

        // 結果表示
        if (data.status === 'success' && data.results && data.results.length > 0) {
            displaySearchResults(data);
            console.log('✅ 検索結果表示完了');
        } else {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <h4>⚠️ 検索結果なし</h4>
                    <p>「${searchQuery}」に一致する研究者が見つかりませんでした。</p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
            console.log('ℹ️ 検索結果なし');
        }

    } catch (error) {
        console.error('❌ API検索エラー:', error);
        console.error('🔗 試行URL:', `${apiClient.baseURL}/api/search`);
        
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <h4>❌ API検索エラー</h4>
                <p><strong>エラー:</strong> ${error.message}</p>
                <p><strong>API URL:</strong> ${apiClient.baseURL}/api/search</p>
                <details>
                    <summary>詳細情報</summary>
                    <pre>${JSON.stringify({
                        name: error.name,
                        message: error.message,
                        baseURL: apiClient.baseURL,
                        searchParams: searchParams
                    }, null, 2)}</pre>
                </details>
            </div>
        `;
    }
}

// 検索結果表示関数
function displaySearchResults(data) {
    const resultsContainer = document.getElementById('api-search-results');
    
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
                <p><strong>📄 主要論文:</strong> ${researcher.paper_title_ja_first || '不明'}</p>
                <p><strong>🎯 プロジェクト:</strong> ${researcher.project_title_ja_first || '不明'}</p>
                
                ${researcher.profile_ja ? `<p><strong>📝 プロフィール:</strong> ${researcher.profile_ja}</p>` : ''}
                
                ${researcher.relevance_score ? `<p><strong>📊 関連度:</strong> ${researcher.relevance_score}</p>` : ''}
                ${researcher.distance ? `<p><strong>📏 距離:</strong> ${researcher.distance}</p>` : ''}
                
                ${researcher.llm_summary ? `
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px;">
                        <strong>🤖 AI要約:</strong> ${researcher.llm_summary}
                    </div>
                ` : ''}
                
                ${researcher.researchmap_url ? `
                    <p><a href="${researcher.researchmap_url}" target="_blank">🔗 ResearchMap</a></p>
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

// 既存のperformAPISearch関数を置き換え
window.performAPISearch = performAPISearchDebug;

console.log('🔧 デバッグ用検索関数を追加しました');
