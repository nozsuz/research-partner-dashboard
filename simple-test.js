// 超シンプルなAPI検索テスト
async function simpleAPITest() {
    console.log('🧪 シンプルAPIテスト開始');
    
    const apiUrl = apiClient.baseURL;
    console.log('📍 Base URL:', apiUrl);
    
    try {
        // 1. ヘルスチェック
        console.log('1️⃣ ヘルスチェック...');
        const healthResponse = await fetch(`${apiUrl}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ ヘルスチェック結果:', healthData);
        
        // 2. GET版のAPI検索テスト
        console.log('2️⃣ GET検索テスト...');
        const getUrl = `${apiUrl}/api/search?query=人工知能&method=semantic&max_results=2`;
        console.log('🔗 GET URL:', getUrl);
        
        const getResponse = await fetch(getUrl);
        console.log('📡 GET Response Status:', getResponse.status);
        
        if (getResponse.ok) {
            const getData = await getResponse.json();
            console.log('✅ GET検索結果:', getData);
            
            // 結果を画面に表示
            document.getElementById('api-search-results').innerHTML = `
                <div style="background: #d4edda; padding: 15px; border-radius: 5px;">
                    <h4>🎉 API接続成功！</h4>
                    <p><strong>検索クエリ:</strong> ${getData.query}</p>
                    <p><strong>結果件数:</strong> ${getData.total}件</p>
                    <p><strong>実行時間:</strong> ${getData.execution_time}秒</p>
                    <details>
                        <summary>詳細結果</summary>
                        <pre>${JSON.stringify(getData, null, 2)}</pre>
                    </details>
                </div>
            `;
            return;
        }
        
        // 3. POST版のAPI検索テスト
        console.log('3️⃣ POST検索テスト...');
        const postData = {
            query: "人工知能",
            method: "semantic",
            max_results: 2,
            use_llm_expansion: false,
            use_llm_summary: false
        };
        
        const postResponse = await fetch(`${apiUrl}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        console.log('📡 POST Response Status:', postResponse.status);
        
        if (postResponse.ok) {
            const postResult = await postResponse.json();
            console.log('✅ POST検索結果:', postResult);
            
            document.getElementById('api-search-results').innerHTML = `
                <div style="background: #d4edda; padding: 15px; border-radius: 5px;">
                    <h4>🎉 POST API接続成功！</h4>
                    <p><strong>検索クエリ:</strong> ${postResult.query}</p>
                    <p><strong>結果件数:</strong> ${postResult.total}件</p>
                    <p><strong>実行時間:</strong> ${postResult.execution_time}秒</p>
                    <pre>${JSON.stringify(postResult, null, 2)}</pre>
                </div>
            `;
        } else {
            throw new Error(`POST failed: ${postResponse.status} ${postResponse.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ シンプルAPIテストエラー:', error);
        document.getElementById('api-search-results').innerHTML = `
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px;">
                <h4>❌ API接続エラー</h4>
                <p><strong>エラー:</strong> ${error.message}</p>
                <p><strong>API URL:</strong> ${apiUrl}</p>
            </div>
        `;
    }
}

// テストボタンを追加する関数
function addSimpleTestButton() {
    const apiContainer = document.getElementById('api-container');
    if (apiContainer) {
        const testButton = document.createElement('button');
        testButton.innerHTML = '🧪 シンプルAPIテスト';
        testButton.className = 'btn btn-warning';
        testButton.onclick = simpleAPITest;
        testButton.style.margin = '10px 0';
        
        // 既存のボタンの前に挿入
        const searchButton = apiContainer.querySelector('button');
        if (searchButton) {
            searchButton.parentNode.insertBefore(testButton, searchButton);
        }
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addSimpleTestButton();
        console.log('🧪 シンプルAPIテストボタンを追加しました');
    }, 1000);
});
