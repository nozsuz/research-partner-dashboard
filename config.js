// 環境変数から動的にStreamlitアプリのURLを取得
const STREAMLIT_APP_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8501' 
    : 'https://researcher-search-app-production.up.railway.app';  // ← 実際のRailway URLに置き換え

function updateStreamlitURL() {
    const iframe = document.querySelector('#streamlit-iframe');
    if (iframe) {
        iframe.src = STREAMLIT_APP_URL;
        console.log('Streamlit URL updated:', STREAMLIT_APP_URL);
    }
}

// ページ読み込み時にURLを更新
document.addEventListener('DOMContentLoaded', function() {
    updateStreamlitURL();
});
