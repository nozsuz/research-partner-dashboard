// プロジェクト管理クラス（API統合版）
// 既に定義されている場合はスキップ
if (typeof window.ProjectManager === 'undefined') {
    window.ProjectManager = class ProjectManager {
        constructor() {
            this.currentProject = null;
            this.selectedResearchers = [];
            this.useAPI = false; // 一時的にAPIを無効化してローカルストレージのみでテスト
        }

        // 仮プロジェクトを作成（API統合版）
        async createTempProject(projectData) {
            if (this.useAPI && window.apiClient) {
                try {
                    // バックエンドAPIを使用
                    const result = await window.apiClient.createTempProject({
                        name: projectData.name,
                        description: projectData.description,
                        budget: projectData.budget ? parseInt(projectData.budget) : null,
                        duration: projectData.duration ? parseInt(projectData.duration) : null,
                        requirements: projectData.requirements,
                        keywords: projectData.keywords,
                        user_id: this.getCurrentUserId()
                    });

                    console.log('✅ API経由で仮プロジェクト作成成功:', result);
                    return result;

                } catch (error) {
                    console.warn('⚠️ API経由の作成失敗、ローカルにフォールバック:', error);
                    // フォールバック：ローカルストレージ
                    return this.createTempProjectLocal(projectData);
                }
            } else {
                // ローカルストレージのみ
                return this.createTempProjectLocal(projectData);
            }
        }

        // ローカル作成（フォールバック）
        createTempProjectLocal(projectData) {
            try {
                console.log('📋 ローカルプロジェクト作成開始:', projectData);
                
                // 入力データのバリデーション
                if (!projectData || !projectData.name || !projectData.description) {
                    throw new Error('プロジェクト名と概要は必須です');
                }

                const projectId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                const tempProject = {
                    id: projectId,
                    name: projectData.name,
                    description: projectData.description,
                    budget: projectData.budget || null,
                    duration: projectData.duration || null,
                    requirements: projectData.requirements || '',
                    keywords: projectData.keywords || '',
                    status: 'draft',
                    created_at: new Date().toISOString(),
                    selected_researchers: []
                };
                
                console.log('📁 作成するプロジェクトデータ:', tempProject);

                // ローカルストレージに保存
                const tempProjects = this.getTempProjectsLocal();
                console.log('💾 保存前のプロジェクト数:', tempProjects.length);
                
                tempProjects.push(tempProject);
                localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
                
                // 保存確認
                const savedProjects = JSON.parse(localStorage.getItem('tempProjects') || '[]');
                console.log('💾 保存後のプロジェクト数:', savedProjects.length);
                console.log('💾 保存されたプロジェクト:', savedProjects[savedProjects.length - 1]);

                console.log('✅ ローカルプロジェクト作成成功:', projectId);
                return tempProject;
            } catch (error) {
                console.error('❌ ローカルプロジェクト作成エラー:', error);
                throw error;
            }
        }

        // 仮プロジェクト一覧を取得（API統合版）
        async getTempProjects() {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.getTempProjects(this.getCurrentUserId());
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由で仮プロジェクト一覧取得成功:', result.projects.length, '件');
                        return result.projects;
                    }
                } catch (error) {
                    console.warn('⚠️ API経由の取得失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカルストレージ
            return this.getTempProjectsLocal();
        }

        // ローカルプロジェクト取得
        getTempProjectsLocal() {
            return JSON.parse(localStorage.getItem('tempProjects') || '[]');
        }

        // 特定プロジェクト取得（API統合版）
        async getTempProject(projectId) {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.getTempProject(projectId);
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由でプロジェクト取得成功:', projectId);
                        return result.project;
                    }
                } catch (error) {
                    console.warn('⚠️ API経由の取得失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカルストレージ
            const tempProjects = this.getTempProjectsLocal();
            return tempProjects.find(p => p.id === projectId);
        }

        // 仮プロジェクトに研究者を追加（API統合版）
        async addResearcherToTempProject(projectId, researcher) {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.addResearcherToProject(projectId, {
                        name: researcher.name,
                        affiliation: researcher.affiliation,
                        researchmap_url: researcher.url,
                        selection_reason: researcher.selection_reason || ''
                    });

                    if (result.status === 'success') {
                        console.log('✅ API経由で研究者追加成功:', researcher.name);
                        return true;
                    }
                } catch (error) {
                    console.warn('⚠️ API経由の追加失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカルストレージ
            return this.addResearcherToTempProjectLocal(projectId, researcher);
        }

        // ローカル研究者追加（フォールバック）
        addResearcherToTempProjectLocal(projectId, researcher) {
            const tempProjects = this.getTempProjectsLocal();
            const project = tempProjects.find(p => p.id === projectId);
            
            if (project) {
                if (!project.selected_researchers) {
                    project.selected_researchers = [];
                }
                
                // 重複チェック
                const exists = project.selected_researchers.some(r => r.name === researcher.name);
                if (!exists) {
                    project.selected_researchers.push({
                        ...researcher,
                        added_at: new Date().toISOString()
                    });
                    localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
                    return true;
                }
            }
            return false;
        }

        // マッチング依頼を送信（API統合版）
        async sendMatchingRequest(projectId, message, priority = 'normal') {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.submitMatchingRequest(projectId, {
                        message: message,
                        priority: priority,
                        request_to_consultant: false
                    });
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由でマッチング依頼送信成功:', result);
                        return { status: 'success', data: result };
                    }
                } catch (error) {
                    console.warn('⚠️ API経由の送信失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカル処理
            this.updateProjectStatusLocal(projectId, 'matching_requested');
            return { 
                status: 'success', 
                message: 'マッチング依頼を送信しました（ローカル保存）',
                fallback: true,
                request_type: 'direct'
            };
        }

        // プロジェクトステータス更新（API統合版）
        async updateProjectStatus(projectId, status) {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.updateProjectStatus(projectId, status);
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由でステータス更新成功:', projectId, status);
                        return true;
                    }
                } catch (error) {
                    console.warn('⚠️ API経由の更新失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカルストレージ
            return this.updateProjectStatusLocal(projectId, status);
        }

        // ローカルステータス更新
        updateProjectStatusLocal(projectId, status) {
            const tempProjects = this.getTempProjectsLocal();
            const project = tempProjects.find(p => p.id === projectId);
            
            if (project) {
                project.status = status;
                project.updated_at = new Date().toISOString();
                localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
                return true;
            }
            
            return false;
        }

        // 現在のユーザーIDを取得（セッション管理）
        getCurrentUserId() {
            // 簡易的なユーザーID（実際の認証システムでは適切に実装）
            let userId = localStorage.getItem('current_user_id');
            if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('current_user_id', userId);
            }
            return userId;
        }

        // API使用可能性をチェック
        async checkAPIAvailability() {
            try {
                if (window.apiClient && typeof window.apiClient.healthCheck === 'function') {
                    const healthCheck = await window.apiClient.healthCheck();
                    this.useAPI = healthCheck.status === 'healthy';
                    console.log(`🔍 API可用性: ${this.useAPI ? 'Available' : 'Unavailable'}`);
                    return this.useAPI;
                } else {
                    console.warn('⚠️ apiClientが利用できません、ローカルモードで動作');
                    this.useAPI = false;
                    return false;
                }
            } catch (error) {
                console.warn('⚠️ API利用不可、ローカルモードで動作:', error);
                this.useAPI = false;
                return false;
            }
        }

        // 研究者をプロジェクトから削除（API統合版）
        async removeResearcherFromProject(projectId, researcherName) {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.removeResearcherFromProject(projectId, researcherName);
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由で研究者削除成功:', researcherName);
                        return true;
                    }
                } catch (error) {
                    console.warn('⚠️ API経由の削除失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカル処理
            const tempProjects = this.getTempProjectsLocal();
            const project = tempProjects.find(p => p.id === projectId);
            
            if (project && project.selected_researchers) {
                const index = project.selected_researchers.findIndex(r => r.name === researcherName);
                if (index !== -1) {
                    project.selected_researchers.splice(index, 1);
                    project.updated_at = new Date().toISOString();
                    localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
                    return true;
                }
            }
            
            return false;
        }

        // 研究者のメモを更新（API統合版）
        async updateResearcherMemo(projectId, researcherName, memo) {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.updateResearcherMemo(projectId, researcherName, memo);
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由で研究者メモ更新成功:', researcherName);
                        return true;
                    }
                } catch (error) {
                    console.warn('⚠️ API経由のメモ更新失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカル処理
            return this.updateResearcherMemoLocal(projectId, researcherName, memo);
        }

        // ローカルメモ更新
        updateResearcherMemoLocal(projectId, researcherName, memo) {
            const tempProjects = this.getTempProjectsLocal();
            const project = tempProjects.find(p => p.id === projectId);
            
            if (project && project.selected_researchers) {
                const researcher = project.selected_researchers.find(r => r.name === researcherName);
                if (researcher) {
                    researcher.memo = memo;
                    researcher.memo_updated_at = new Date().toISOString();
                    project.updated_at = new Date().toISOString();
                    localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
                    return true;
                }
            }
            
            return false;
        }

        // コンサルタントへのマッチング依頼を送信（API統合版）
        async sendMatchingRequestToConsultant(projectId, message, consultantRequirements, priority = 'normal') {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.submitMatchingRequest(projectId, {
                        message: message,
                        priority: priority,
                        request_to_consultant: true,
                        consultant_requirements: consultantRequirements
                    });
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由でコンサルタントへのマッチング依頼送信成功:', result);
                        return { status: 'success', data: result };
                    }
                } catch (error) {
                    console.warn('⚠️ API経由のコンサルタント送信失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカル処理
            this.updateProjectStatusLocal(projectId, 'matching_requested');
            
            // コンサルタント依頼情報をローカルに保存
            const tempProjects = this.getTempProjectsLocal();
            const project = tempProjects.find(p => p.id === projectId);
            if (project) {
                project.consultant_request = {
                    message: message,
                    requirements: consultantRequirements,
                    priority: priority,
                    requested_at: new Date().toISOString(),
                    type: 'consultant'
                };
                localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
            }
            
            return { 
                status: 'success', 
                message: 'コンサルタントへのマッチング依頼を送信しました（ローカル保存）',
                fallback: true,
                request_type: 'consultant'
            };
        }

        // 仮プロジェクトを削除（API統合版）
        async deleteTempProject(projectId) {
            if (this.useAPI && window.apiClient) {
                try {
                    const result = await window.apiClient.deleteTempProject(projectId);
                    
                    if (result.status === 'success') {
                        console.log('✅ API経由でプロジェクト削除成功:', projectId);
                        return { status: 'success', api: true };
                    }
                } catch (error) {
                    console.warn('⚠️ API経由の削除失敗、ローカルにフォールバック:', error);
                }
            }

            // フォールバック：ローカルストレージ
            return this.deleteTempProjectLocal(projectId);
        }

        // ローカルプロジェクト削除
        deleteTempProjectLocal(projectId) {
            try {
                const tempProjects = this.getTempProjectsLocal();
                const index = tempProjects.findIndex(p => p.id === projectId);
                
                if (index !== -1) {
                    const deletedProject = tempProjects.splice(index, 1)[0];
                    localStorage.setItem('tempProjects', JSON.stringify(tempProjects));
                    
                    console.log('✅ ローカルプロジェクト削除成功:', deletedProject.name);
                    return { status: 'success', api: false, project: deletedProject };
                } else {
                    throw new Error('指定されたプロジェクトが見つかりません');
                }
            } catch (error) {
                console.error('❌ ローカルプロジェクト削除エラー:', error);
                return { status: 'error', message: error.message };
            }
        }

        // プロジェクトデータの同期（API ⇄ ローカル）
        async syncProjectData() {
            if (!this.useAPI) return;

            try {
                const localProjects = this.getTempProjectsLocal();
                const apiProjects = await this.getTempProjects();

                // 簡易的な同期ロジック（実際の実装ではもっと複雑になる）
                console.log('🔄 プロジェクトデータ同期実行中...');
                console.log('ローカル:', localProjects.length, 'API:', apiProjects.length);

            } catch (error) {
                console.error('❌ データ同期エラー:', error);
            }
        }
    };
}

// グローバルインスタンスの初期化
function initializeProjectManager() {
    if (!window.projectManager) {
        console.log('🚀 プロジェクトマネージャー初期化開始');
        window.projectManager = new window.ProjectManager();
        console.log('✅ プロジェクトマネージャー初期化完了');
    }
    return window.projectManager;
}

// 即座に初期化
const projectManager = initializeProjectManager();

// ページ読み込み時にAPI可用性をチェック
document.addEventListener('DOMContentLoaded', async function() {
    // プロジェクトマネージャーが確実に存在することを確認
    const manager = window.projectManager || initializeProjectManager();
    
    try {
        await manager.checkAPIAvailability();
        console.log('🔍 API可用性チェック完了');
    } catch (error) {
        console.warn('⚠️ API可用性チェックでエラー:', error);
    }
});
