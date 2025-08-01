// 通用函数：刷新页面
function refreshPage() {
    location.reload();
}

// 通用函数：返回上一页
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // 如果没有历史记录，返回桌面
        window.location.href = '/';
    }
}

// 安全中心页面功能
class SecurityCenter {
    constructor() {
        this.currentScanId = null;
        this.scanInterval = null;
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSecurityData();
        this.loadRecommendations();
        this.loadSecurityHistory('today');
        
        // 定期更新安全状态
        this.updateInterval = setInterval(() => {
            this.loadSecurityData();
        }, 30000); // 每30秒更新一次
    }

    setupEventListeners() {
        // 快速扫描按钮
        const quickScanBtn = document.getElementById('quick-scan-btn');
        if (quickScanBtn) {
            quickScanBtn.addEventListener('click', () => this.startScan('quick'));
        }

        // 查看详情按钮
        const viewDetailsBtn = document.getElementById('view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => this.showSecurityDetails());
        }

        // 功能切换开关
        const firewallToggle = document.getElementById('firewall-toggle');
        if (firewallToggle) {
            firewallToggle.addEventListener('change', (e) => {
                this.toggleSecurityFeature('firewall', e.target.checked);
            });
        }

        const antivirusToggle = document.getElementById('antivirus-toggle');
        if (antivirusToggle) {
            antivirusToggle.addEventListener('change', (e) => {
                this.toggleSecurityFeature('antivirus', e.target.checked);
            });
        }

        // 更新按钮
        const updateBtn = document.getElementById('update-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.checkForUpdates());
        }

        // 账户设置按钮
        const accountBtn = document.getElementById('account-btn');
        if (accountBtn) {
            accountBtn.addEventListener('click', () => this.openAccountSettings());
        }

        // 刷新建议按钮
        const refreshRecommendationsBtn = document.getElementById('refresh-recommendations');
        if (refreshRecommendationsBtn) {
            refreshRecommendationsBtn.addEventListener('click', () => this.loadRecommendations());
        }

        // 历史记录时间段按钮
        const historyBtns = document.querySelectorAll('.history-btn');
        historyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除所有活动状态
                historyBtns.forEach(b => b.classList.remove('active'));
                // 添加当前按钮的活动状态
                e.target.classList.add('active');
                // 加载对应时间段的历史记录
                this.loadSecurityHistory(e.target.dataset.period);
            });
        });

        // 扫描模态框关闭按钮
        const scanModalClose = document.getElementById('scan-modal-close');
        if (scanModalClose) {
            scanModalClose.addEventListener('click', () => this.closeScanModal());
        }

        // 点击模态框外部关闭
        const scanModal = document.getElementById('scan-modal');
        if (scanModal) {
            scanModal.addEventListener('click', (e) => {
                if (e.target === scanModal) {
                    this.closeScanModal();
                }
            });
        }

        console.log('安全中心页面已初始化');
    }

    async loadSecurityData() {
        try {
            const response = await fetch('/api/security-status');
            const data = await response.json();

            if (data.error) {
                console.error('获取安全状态失败:', data.error);
                return;
            }

            this.updateSecurityStatus(data);
            this.updateFeatureCards(data);
        } catch (error) {
            console.error('加载安全数据失败:', error);
        }
    }

    updateSecurityStatus(data) {
        const statusTitle = document.getElementById('security-status-title');
        const statusMessage = document.getElementById('security-status-message');
        const statusDetail = document.getElementById('security-status-detail');
        const mainIcon = document.getElementById('main-security-icon');

        if (data.security_level === 'excellent') {
            statusTitle.textContent = '系统安全';
            statusMessage.textContent = '您的设备受到保护';
            statusDetail.textContent = '所有安全功能都在正常运行';
            mainIcon.className = 'fas fa-shield-alt';
            mainIcon.style.color = '#107c10';
        } else if (data.security_level === 'good') {
            statusTitle.textContent = '系统基本安全';
            statusMessage.textContent = '大部分功能正常';
            statusDetail.textContent = '建议检查一些安全设置';
            mainIcon.className = 'fas fa-shield-alt';
            mainIcon.style.color = '#ca5010';
        } else if (data.security_level === 'warning') {
            statusTitle.textContent = '需要注意';
            statusMessage.textContent = '发现一些安全问题';
            statusDetail.textContent = '建议立即处理安全问题';
            mainIcon.className = 'fas fa-exclamation-triangle';
            mainIcon.style.color = '#d13438';
        } else {
            statusTitle.textContent = '安全风险';
            statusMessage.textContent = '存在严重安全问题';
            statusDetail.textContent = '请立即采取行动保护您的系统';
            mainIcon.className = 'fas fa-exclamation-triangle';
            mainIcon.style.color = '#d13438';
        }
    }

    updateFeatureCards(data) {
        // 更新防火墙状态
        const firewallStatus = document.getElementById('firewall-status');
        const firewallToggle = document.getElementById('firewall-toggle');
        const firewallBlocked = document.getElementById('firewall-blocked');
        const firewallUpdated = document.getElementById('firewall-updated');

        if (firewallStatus && firewallToggle) {
            firewallToggle.checked = data.firewall_active;
            firewallStatus.textContent = data.firewall_active ? '已启用' : '已禁用';
            firewallStatus.className = `feature-status ${data.firewall_active ? 'enabled' : 'disabled'}`;
        }
        if (firewallBlocked) firewallBlocked.textContent = data.threats_blocked || 0;
        if (firewallUpdated) firewallUpdated.textContent = '刚刚';

        // 更新防病毒状态
        const antivirusStatus = document.getElementById('antivirus-status');
        const antivirusToggle = document.getElementById('antivirus-toggle');
        const antivirusScan = document.getElementById('antivirus-scan');
        const antivirusDefinitions = document.getElementById('antivirus-definitions');

        if (antivirusStatus && antivirusToggle) {
            antivirusToggle.checked = data.antivirus_active;
            antivirusStatus.textContent = data.antivirus_active ? '已启用' : '已禁用';
            antivirusStatus.className = `feature-status ${data.antivirus_active ? 'enabled' : 'disabled'}`;
        }
        if (antivirusScan) antivirusScan.textContent = data.last_scan || '今天';
        if (antivirusDefinitions) antivirusDefinitions.textContent = '最新';

        // 更新系统更新状态
        const updateStatus = document.getElementById('update-status');
        const availableUpdates = document.getElementById('available-updates');
        const lastCheck = document.getElementById('last-check');

        if (updateStatus) {
            if (data.updates_available > 0) {
                updateStatus.textContent = '有可用更新';
                updateStatus.className = 'feature-status warning';
            } else {
                updateStatus.textContent = '已是最新';
                updateStatus.className = 'feature-status enabled';
            }
        }
        if (availableUpdates) availableUpdates.textContent = data.updates_available || 0;
        if (lastCheck) lastCheck.textContent = '1小时前';

        // 更新账户保护状态
        const accountStatus = document.getElementById('account-status');
        const loginAttempts = document.getElementById('login-attempts');
        const permissionRequests = document.getElementById('permission-requests');

        if (accountStatus) {
            accountStatus.textContent = '已启用';
            accountStatus.className = 'feature-status enabled';
        }
        if (loginAttempts) loginAttempts.textContent = data.failed_logins || 0;
        if (permissionRequests) permissionRequests.textContent = data.permission_requests || 2;
    }

    async startScan(type = 'quick') {
        try {
            const response = await fetch('/api/security-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });

            const data = await response.json();
            
            if (data.error) {
                console.error('启动扫描失败:', data.error);
                return;
            }

            this.currentScanId = data.scan_id;
            this.showScanModal();
            this.updateScanProgress(data);
            
            // 开始轮询扫描状态
            this.scanInterval = setInterval(() => {
                this.checkScanStatus();
            }, 2000);

        } catch (error) {
            console.error('启动扫描失败:', error);
        }
    }

    async checkScanStatus() {
        if (!this.currentScanId) return;

        try {
            const response = await fetch(`/api/security-scan/${this.currentScanId}`);
            const data = await response.json();

            this.updateScanProgress(data);

            if (data.status === 'completed') {
                clearInterval(this.scanInterval);
                this.scanInterval = null;
                
                // 延迟关闭模态框
                setTimeout(() => {
                    this.closeScanModal();
                    this.showScanResults(data);
                }, 2000);
            }
        } catch (error) {
            console.error('检查扫描状态失败:', error);
        }
    }

    updateScanProgress(data) {
        const scanStatus = document.getElementById('scan-status');
        const scanDetail = document.getElementById('scan-detail');
        const scanProgress = document.getElementById('scan-progress');
        const scannedFiles = document.getElementById('scanned-files');
        const threatsFound = document.getElementById('threats-found');
        const timeRemaining = document.getElementById('time-remaining');

        if (scanStatus) {
            if (data.status === 'completed') {
                scanStatus.textContent = '扫描完成';
            } else {
                scanStatus.textContent = '正在扫描系统...';
            }
        }

        if (scanDetail) {
            scanDetail.textContent = data.current_file || '检查系统文件和设置';
        }

        if (scanProgress) {
            scanProgress.style.width = `${data.progress || 0}%`;
        }

        if (scannedFiles) scannedFiles.textContent = data.files_scanned || 0;
        if (threatsFound) threatsFound.textContent = data.threats_found || 0;
        if (timeRemaining) {
            const remaining = data.estimated_time || 0;
            if (remaining > 0) {
                timeRemaining.textContent = `${Math.ceil(remaining)}秒`;
            } else {
                timeRemaining.textContent = '即将完成';
            }
        }
    }

    showScanModal() {
        const modal = document.getElementById('scan-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeScanModal() {
        const modal = document.getElementById('scan-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // 清理扫描状态
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.currentScanId = null;
    }

    showScanResults(data) {
        let message = `扫描完成！\n已扫描 ${data.files_scanned} 个文件`;
        
        if (data.threats_found > 0) {
            message += `\n发现 ${data.threats_found} 个威胁，已自动处理`;
        } else {
            message += '\n未发现威胁，系统安全';
        }

        alert(message);
        
        // 重新加载安全数据
        this.loadSecurityData();
    }

    async toggleSecurityFeature(feature, enabled) {
        try {
            const response = await fetch('/api/security-toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ feature, enabled })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(data.message);
                // 重新加载安全数据
                this.loadSecurityData();
            } else {
                console.error('切换功能失败:', data.error);
            }
        } catch (error) {
            console.error('切换功能失败:', error);
        }
    }

    checkForUpdates() {
        alert('正在检查系统更新...\n这可能需要几分钟时间。');
        
        // 模拟更新检查
        setTimeout(() => {
            alert('更新检查完成！\n发现 3 个可用更新，建议尽快安装。');
        }, 2000);
    }

    openAccountSettings() {
        alert('账户保护设置\n\n当前设置：\n- 用户账户控制：已启用\n- 登录保护：已启用\n- 权限管理：严格模式');
    }

    showSecurityDetails() {
        alert('安全详情\n\n系统安全评分：90/100\n\n详细信息：\n- 防火墙：正常运行\n- 病毒防护：实时保护已启用\n- 系统更新：有可用更新\n- 账户保护：已启用');
    }

    async loadRecommendations() {
        try {
            const response = await fetch('/api/security-recommendations');
            const data = await response.json();

            if (data.error) {
                console.error('获取安全建议失败:', data.error);
                return;
            }

            this.renderRecommendations(data);
        } catch (error) {
            console.error('加载安全建议失败:', error);
        }
    }

    renderRecommendations(recommendations) {
        const container = document.getElementById('recommendations-list');
        if (!container) return;

        container.innerHTML = '';

        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            
            const iconClass = rec.type === 'warning' ? 'warning' : 'info';
            const iconName = rec.type === 'warning' ? 'exclamation-triangle' : 'info-circle';

            item.innerHTML = `
                <div class="recommendation-icon ${iconClass}">
                    <i class="fas fa-${iconName}"></i>
                </div>
                <div class="recommendation-content">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-description">${rec.description}</div>
                </div>
                <div class="recommendation-action">
                    <button class="recommendation-btn" onclick="securityCenter.handleRecommendation('${rec.action}')">
                        处理
                    </button>
                </div>
            `;

            container.appendChild(item);
        });
    }

    handleRecommendation(action) {
        switch (action) {
            case 'enable_auto_update':
                alert('正在启用自动更新...\n自动更新已启用，系统将自动下载并安装安全更新。');
                break;
            case 'setup_backup':
                alert('数据备份设置\n\n建议：\n- 定期备份重要文件\n- 使用云存储服务\n- 创建系统还原点');
                break;
            case 'update_password_policy':
                alert('密码策略更新\n\n建议：\n- 使用强密码（8位以上）\n- 包含大小写字母、数字和符号\n- 定期更换密码');
                break;
            default:
                alert('正在处理该建议...');
        }
    }

    async loadSecurityHistory(period) {
        try {
            const response = await fetch(`/api/security-history?period=${period}`);
            const data = await response.json();

            if (data.error) {
                console.error('获取安全历史失败:', data.error);
                return;
            }

            this.renderSecurityHistory(data);
        } catch (error) {
            console.error('加载安全历史失败:', error);
        }
    }

    renderSecurityHistory(history) {
        const container = document.getElementById('history-list');
        if (!container) return;

        container.innerHTML = '';

        if (history.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">暂无历史记录</div>';
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const iconName = item.type === 'success' ? 'check-circle' : 
                           item.type === 'warning' ? 'exclamation-triangle' : 'times-circle';

            historyItem.innerHTML = `
                <div class="history-icon ${item.type}">
                    <i class="fas fa-${iconName}"></i>
                </div>
                <div class="history-content">
                    <div class="history-title">${item.title}</div>
                    <div class="history-description">${item.description}</div>
                    <div class="history-time">${item.time}</div>
                </div>
            `;

            container.appendChild(historyItem);
        });
    }

    // 清理资源
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
        }
    }
}

// 全局变量，供HTML中的onclick使用
let securityCenter;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    securityCenter = new SecurityCenter();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    if (securityCenter) {
        securityCenter.destroy();
    }
});