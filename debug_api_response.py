"""
フロントエンド/バックエンド連携確認スクリプト
実際のAPIレスポンスと表示される内容を詳細確認
"""

import requests
import json

def test_api_response():
    """API検索の実際のレスポンスを確認"""
    
    # Railway URL
    base_url = "https://researcher-search-app-production.up.railway.app"
    
    print("🔍 API検索レスポンス詳細確認")
    print("="*50)
    
    # テスト用の検索パラメータ
    test_cases = [
        {
            "query": "医療",
            "method": "keyword",
            "max_results": 2,
            "use_llm_expansion": False,
            "use_llm_summary": False
        },
        {
            "query": "人工知能",
            "method": "semantic", 
            "max_results": 2,
            "use_llm_expansion": False,
            "use_llm_summary": True
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 テストケース {i}: {test_case['query']} ({test_case['method']})")
        print("-" * 30)
        
        try:
            # POST検索を実行
            response = requests.post(
                f"{base_url}/api/search",
                json=test_case,
                timeout=30
            )
            
            print(f"ステータスコード: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # レスポンス構造を分析
                print(f"✅ 検索成功")
                print(f"📊 基本情報:")
                print(f"  - ステータス: {data.get('status')}")
                print(f"  - クエリ: {data.get('query')}")
                print(f"  - 検索方法: {data.get('method')}")
                print(f"  - 結果件数: {data.get('total', 0)}")
                print(f"  - 実行時間: {data.get('execution_time', 0):.2f}秒")
                print(f"  - 実行情報: {data.get('executed_query_info', 'N/A')}")
                
                # 実行情報をチェック（モックかどうかの判定）
                executed_info = data.get('executed_query_info', '')
                if 'モック' in executed_info:
                    print(f"⚠️ 警告: モック検索が実行されています！")
                    print(f"  実行情報: {executed_info}")
                elif '実際のGCP検索実行' in executed_info:
                    print(f"✅ 実際のGCP検索が実行されています")
                
                # 拡張情報の確認
                if data.get('expanded_info'):
                    expanded = data['expanded_info']
                    print(f"🧠 拡張情報:")
                    print(f"  - 元クエリ: {expanded.get('original_query')}")
                    print(f"  - 拡張キーワード: {expanded.get('expanded_keywords')}")
                
                # 検索結果の詳細分析
                results = data.get('results', [])
                print(f"\n📝 検索結果詳細:")
                
                if results:
                    for j, result in enumerate(results):
                        print(f"\n  結果 {j+1}:")
                        print(f"    - 名前: {result.get('name_ja', 'N/A')}")
                        print(f"    - 所属: {result.get('main_affiliation_name_ja', 'N/A')}")
                        print(f"    - キーワード: {result.get('research_keywords_ja', 'N/A')[:100]}...")
                        
                        # スコア情報
                        if test_case['method'] == 'keyword':
                            score = result.get('relevance_score')
                            print(f"    - 関連度スコア: {score}")
                        elif test_case['method'] == 'semantic':
                            distance = result.get('distance')
                            print(f"    - セマンティック距離: {distance}")
                        
                        # AI要約
                        if result.get('llm_summary'):
                            print(f"    - AI要約: {result['llm_summary'][:100]}...")
                        
                        # データの起源チェック
                        if 'サンプル大学' in result.get('main_affiliation_name_ja', ''):
                            print(f"    ⚠️ 警告: モックデータの可能性があります！")
                        
                        # 実際の研究者データかチェック
                        real_data_indicators = [
                            result.get('researchmap_url', '').startswith('https://researchmap.jp/'),
                            result.get('research_keywords_ja') and len(result.get('research_keywords_ja', '')) > 20,
                            result.get('profile_ja') and len(result.get('profile_ja', '')) > 100
                        ]
                        
                        real_data_score = sum(real_data_indicators)
                        if real_data_score >= 2:
                            print(f"    ✅ 実際の研究者データと判定 (信頼度: {real_data_score}/3)")
                        else:
                            print(f"    ❓ モックデータの可能性 (信頼度: {real_data_score}/3)")
                else:
                    print("  📭 検索結果が空です")
                
            else:
                print(f"❌ APIエラー: {response.status_code}")
                print(f"エラー内容: {response.text[:200]}...")
                
        except Exception as e:
            print(f"❌ リクエストエラー: {e}")
    
    print(f"\n🎯 結論:")
    print("1. APIが実際のGCP検索を実行しているかチェック")
    print("2. 返される研究者データが実際のデータかチェック") 
    print("3. フロントエンドの表示ロジックをチェック")

def check_backend_directly():
    """バックエンドの状況を直接確認"""
    
    base_url = "https://researcher-search-app-production.up.railway.app"
    
    print(f"\n🔧 バックエンド詳細確認")
    print("="*30)
    
    endpoints = [
        ("/health", "ヘルスチェック"),
        ("/test/env", "環境変数確認"),
        ("/test/gcp", "GCP接続確認"),
        ("/test/real-search", "実際の検索テスト")
    ]
    
    for endpoint, description in endpoints:
        print(f"\n🔍 {description}")
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                if endpoint == "/test/env":
                    basic_config = data.get('basic_config', {})
                    print(f"  ENABLE_GCP_INITIALIZATION: {basic_config.get('ENABLE_GCP_INITIALIZATION')}")
                    print(f"  PROJECT_ID: {basic_config.get('PROJECT_ID')}")
                    
                elif endpoint == "/test/gcp":
                    tests = data.get('tests', {})
                    bigquery = tests.get('bigquery', {})
                    vertex_ai = tests.get('vertex_ai', {})
                    print(f"  BigQuery: {bigquery.get('status')}")
                    print(f"  Vertex AI: {vertex_ai.get('status')}")
                    if bigquery.get('total_researchers'):
                        print(f"  研究者データ総数: {bigquery['total_researchers']:,}件")
                
                elif endpoint == "/test/real-search":
                    print(f"  テストステータス: {data.get('test_status')}")
                    result_summary = data.get('result_summary', {})
                    print(f"  検索ステータス: {result_summary.get('status')}")
                    print(f"  検索方法: {result_summary.get('method')}")
                    print(f"  結果件数: {result_summary.get('total_results')}")
                    
                elif endpoint == "/health":
                    clients_status = data.get('clients_status', {})
                    print(f"  初期化済み: {clients_status.get('initialized')}")
                    print(f"  BigQuery: {clients_status.get('bigquery')}")
                    print(f"  Vertex AI: {clients_status.get('vertex_ai')}")
                    
            else:
                print(f"  ❌ エラー: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ エラー: {e}")

if __name__ == "__main__":
    test_api_response()
    check_backend_directly()
