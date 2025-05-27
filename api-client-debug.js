// デバッグ用の改良されたAPI設定とユーティリティ関数
class ResearcherSearchAPI {
    constructor() {
        // 環境に応じてAPIのベースURLを設定
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:8000'  // ローカル開発
            : 'https://researcher-search-app-production.up.railway.app';  // 本番環境 ← ここを修正してください
        
        console.log('🌐 API Base URL:', this.baseURL);
        console.log('🏠 Current hostname:', window.location.hostname);
        console.log('📍 Full URL:', window.location.href);
        
        // デバッグ情報を画面に表示
        this.showDebugInfo();
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

    // ヘルスチェック（詳細デバッグ版）
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
            console.log('🌐 Response Headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 ヘルスチェック結果:', data);
            return data;
            
        } catch (error) {
            console.error('❌ ヘルスチェック失敗:', error);
            console.error('🔗 試行URL:', `${this.baseURL}/health`);
            
            // エラータイプによる詳細メッセージ
            let errorMessage = error.message;
            let errorDetails = {
                name: error.name,
                message: error.message,
                url: `${this.baseURL}/health`,
                baseURL: this.baseURL,
                hostname: window.location.hostname
            };
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'ネットワーク接続エラー: APIサーバーにアクセスできません';
                errorDetails.suggestion = 'URLが間違っているか、CORSエラー、またはサーバー停止の可能性';
            } else if (error.name === 'TimeoutError') {
                errorMessage = 'タイムアウト: APIサーバーの応答が遅すぎます';
                errorDetails.suggestion = 'サーバーが重いか、ネットワークが不安定';
            }
            
            return { 
                status: 'error', 
                message: errorMessage,
                details: errorDetails,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 簡易接続テスト（詳細デバッグ版）
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
            console.log('🌐 Response URL:', response.url);
            console.log('🔒 Response Type:', response.type);
            
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
                },
                possibleCauses: [
                    'APIサーバーが停止している',
                    'URLが間違っている（スペルミス、末尾の/など）',
                    'CORS設定の問題',
                    'ネットワーク接続の問題',
                    'ファイアウォールによるブロック'
                ]
            };
        }
    }

    // 研究者検索（現在は未実装応答）
    async searchResearchers(searchParams) {
        try {
            // 現在のシンプルサーバーには検索機能がないので、適切なエラーを返す
            const response = await fetch(`${this.baseURL}/api/search`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParams),
                signal: AbortSignal.timeout(10000)
            });

            if (response.status === 404) {
                throw new Error('検索機能はまだ実装されていません（/api/search エンドポイントが見つかりません）');
            }

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

// ヘルスチェック関数（詳細デバッグ版）
async function checkAPIHealth() {
    try {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.style.display = 'block';
            statusElement.innerHTML += '<div style="color: blue;">🔄 API接続確認中...</div>';
        }
        
        console.log('🏥 ヘルスチェック開始...');
        
        // 簡易接続テストとヘルスチェックを順次実行（並行実行だとデバッグが困難）
        console.log('1️⃣ 簡易接続テスト実行...');
        const connectionTest = await apiClient.simpleConnectionTest();
        console.log('📊 簡易接続テスト結果:', connectionTest);
        
        console.log('2️⃣ ヘルスチェック実行...');
        const healthCheck = await apiClient.healthCheck();
        console.log('📊 ヘルスチェック結果:', healthCheck);
        
        if (statusElement) {
            let statusHTML = '';
            
            if (connectionTest.status === 'success' && healthCheck.status === 'healthy') {
                statusHTML = '<div style="color: green;">🟢 API接続正常 - サーバー稼働中</div>';
            } else if (connectionTest.status === 'success') {
                statusHTML = '<div style="color: orange;">🟡 基本接続は可能 - ヘルスチェックに問題あり</div>';
            } else {
                statusHTML = `<div style="color: red;">🔴 API接続失敗</div>`;
                statusHTML += `<div style="font-size: 12px; margin-top: 5px;">`;
                statusHTML += `<strong>エラー:</strong> ${connectionTest.message}<br>`;
                if (connectionTest.possibleCauses) {
                    statusHTML += `<strong>可能性:</strong><br>`;
                    connectionTest.possibleCauses.forEach(cause => {
                        statusHTML += `• ${cause}<br>`;
                    });
                }
                statusHTML += `</div>`;
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

// その他の関数は既存のまま使用
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
            API検索を実行中...（現在は未実装機能のテスト）
        </div>
    `;

    try {
        const searchParams = {
            query: searchQuery,
            method: document.getElementById('search-method').value,
            maxResults: parseInt(document.getElementById('max-results').value),
            useLLMExpansion: document.getElementById('llm-expansion').checked,
            useLLMSummary: document.getElementById('llm-summary').checked
        };

        console.log('🔍 API検索テスト開始:', searchParams);
        await apiClient.searchResearchers(searchParams);

    } catch (error) {
        console.error('🔍 API検索エラー:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <h4>ℹ️ 予想されるエラー</h4>
                <p><strong>エラー内容:</strong> ${error.message}</p>
                <p>これは正常です。現在のシンプルサーバーには検索機能が実装されていません。</p>
                <p>基本接続テストとヘルスチェックが成功していれば、APIサーバーは正常に稼働しています。</p>
            </div>
        `;
    }
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
                    <small>※ 現在は基本サーバーのみ稼働中。検索機能は後で実装予定。</small>
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
    alert(`${name}の詳細ページへ遷移します（API連携完了後に実装予定）`);
}

function addToProjectCandidates(name) {
    alert(`${name}をプロジェクト候補に追加しました。`);
}

document.addEventListener('DOMContentLoaded', function() {
    toggleAPISearchMode('api');
    console.log('🚀 詳細デバッグ版APIクライアント初期化完了');
});
