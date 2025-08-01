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

// 系统信息页面功能
class SystemInfoManager {
    constructor() {
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSystemInfo();
    }

    setupEventListeners() {
        // 导航项点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavigation(e.currentTarget);
            });
        });

        // 窗口控制按钮
        const closeBtn = document.querySelector('.control-btn.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.close();
            });
        }

        const minimizeBtn = document.querySelector('.control-btn.minimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                // 最小化功能（在实际应用中需要与桌面环境集成）
                console.log('最小化窗口');
            });
        }

        const maximizeBtn = document.querySelector('.control-btn.maximize');
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                // 最大化功能
                this.toggleMaximize();
            });
        }
    }

    handleNavigation(navItem) {
        // 移除所有活动状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // 添加活动状态到当前项
        navItem.classList.add('active');

        // 隐藏所有面板
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // 根据导航项显示对应面板
        const navText = navItem.querySelector('span').textContent;
        let targetPanel = null;

        switch(navText) {
            case '系统状态':
                targetPanel = document.getElementById('system-status-panel');
                this.loadSystemInfo();
                break;
            case '个性化':
                targetPanel = document.getElementById('personalization-panel');
                this.loadPersonalizationSettings();
                break;
            case '用户管理':
                targetPanel = document.getElementById('user-management-panel');
                this.loadUserManagement();
                break;
            case 'SSH管理':
                targetPanel = document.getElementById('ssh-management-panel');
                this.loadSSHManagement();
                break;
            case '系统管理':
                targetPanel = document.getElementById('system-management-panel');
                this.loadSystemManagement();
                break;
            case 'MFA':
                targetPanel = document.getElementById('mfa-panel');
                this.loadMFASettings();
                break;
            case 'DNS设置':
                targetPanel = document.getElementById('dns-settings-panel');
                this.loadDNSSettings();
                break;
            case 'Swap虚拟内存':
                targetPanel = document.getElementById('swap-memory-panel');
                this.loadSwapMemoryInfo();
                break;
            case '到期设置':
                targetPanel = document.getElementById('expiry-settings-panel');
                this.loadExpirySettings();
                break;
            case '许可证':
                targetPanel = document.getElementById('license-panel');
                this.loadLicenseInfo();
                break;
            default:
                targetPanel = document.getElementById('system-status-panel');
                this.loadSystemInfo();
        }

        // 显示目标面板
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        // 更新面包屑
        this.updateBreadcrumb(navText);
    }

    updateBreadcrumb(title) {
        const breadcrumb = document.querySelector('.breadcrumb span');
        if (breadcrumb) {
            breadcrumb.textContent = title;
        }
    }

    // 加载个性化设置
    loadPersonalizationSettings() {
        // 设置事件监听器
        this.setupPersonalizationEvents();
    }

    setupPersonalizationEvents() {
        // 主题设置
        const themeSelect = document.querySelector('.setting-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        }

        // 桌面设置按钮
        const desktopButton = document.querySelector('.setting-button');
        if (desktopButton) {
            desktopButton.addEventListener('click', () => {
                this.showNotification('桌面配置功能开发中...');
            });
        }
    }

    changeTheme(theme) {
        this.showNotification(`主题已切换到: ${theme}`);
        // 这里可以实现实际的主题切换逻辑
    }

    // 加载用户管理
    loadUserManagement() {
        this.setupUserManagementEvents();
    }

    setupUserManagementEvents() {
        // 添加用户按钮
        const addUserBtn = document.querySelector('.action-button.primary');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showNotification('添加用户功能开发中...');
            });
        }

        // 编辑用户按钮
        const editUserBtn = document.querySelector('.action-button:not(.primary):not(.danger)');
        if (editUserBtn) {
            editUserBtn.addEventListener('click', () => {
                this.showNotification('编辑用户功能开发中...');
            });
        }

        // 删除用户按钮
        const deleteUserBtn = document.querySelector('.action-button.danger');
        if (deleteUserBtn) {
            deleteUserBtn.addEventListener('click', () => {
                this.showNotification('删除用户功能开发中...');
            });
        }
    }

    // 加载SSH管理
    loadSSHManagement() {
        this.setupSSHManagementEvents();
    }

    setupSSHManagementEvents() {
        // SSH服务切换按钮
        const statusToggle = document.querySelector('.status-toggle');
        if (statusToggle) {
            statusToggle.addEventListener('click', () => {
                this.toggleSSHService();
            });
        }

        // 断开连接按钮
        const disconnectBtn = document.querySelector('.disconnect-button');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                this.disconnectSSHConnection();
            });
        }
    }

    toggleSSHService() {
        const toggle = document.querySelector('.status-toggle');
        const statusIcon = document.querySelector('.status-icon');
        const statusInfo = document.querySelector('.status-info p');

        if (toggle.textContent === '停止') {
            toggle.textContent = '启动';
            toggle.style.borderColor = '#30d158';
            toggle.style.color = '#30d158';
            statusIcon.classList.remove('active');
            statusInfo.textContent = '已停止';
            this.showNotification('SSH服务已停止');
        } else {
            toggle.textContent = '停止';
            toggle.style.borderColor = '#ff453a';
            toggle.style.color = '#ff453a';
            statusIcon.classList.add('active');
            statusInfo.textContent = '运行中 - 端口 22';
            this.showNotification('SSH服务已启动');
        }
    }

    disconnectSSHConnection() {
        this.showNotification('SSH连接已断开');
        // 这里可以实现实际的断开连接逻辑
    }

    // 加载系统管理
    loadSystemManagement() {
        this.setupSystemManagementEvents();
    }

    setupSystemManagementEvents() {
        // 重启系统按钮
        const restartBtn = document.querySelector('.control-button.restart');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.confirmSystemAction('重启系统', '确定要重启系统吗？');
            });
        }

        // 关闭系统按钮
        const shutdownBtn = document.querySelector('.control-button.shutdown');
        if (shutdownBtn) {
            shutdownBtn.addEventListener('click', () => {
                this.confirmSystemAction('关闭系统', '确定要关闭系统吗？');
            });
        }

        // 系统更新按钮
        const updateBtn = document.querySelector('.control-button.update');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.showNotification('正在检查系统更新...');
            });
        }

        // 服务按钮
        const serviceButtons = document.querySelectorAll('.service-button');
        serviceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification(`${btn.textContent}服务功能开发中...`);
            });
        });
    }

    confirmSystemAction(action, message) {
        if (confirm(message)) {
            this.showNotification(`${action}命令已发送`);
            // 这里可以实现实际的系统操作
        }
    }

    // 加载MFA设置
    loadMFASettings() {
        this.setupMFAEvents();
    }

    setupMFAEvents() {
        const mfaButtons = document.querySelectorAll('.mfa-button');
        mfaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification('MFA配置功能开发中...');
            });
        });
    }

    // 加载DNS设置
    loadDNSSettings() {
        this.setupDNSEvents();
    }

    setupDNSEvents() {
        // 保存设置按钮
        const saveBtn = document.querySelector('.dns-button.primary');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveDNSSettings();
            });
        }

        // 测试连接按钮
        const testBtn = document.querySelector('.dns-button:not(.primary)');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testDNSConnection();
            });
        }
    }

    saveDNSSettings() {
        const primaryDNS = document.querySelector('.dns-input:first-of-type').value;
        const secondaryDNS = document.querySelector('.dns-input:last-of-type').value;
        
        this.showNotification(`DNS设置已保存: ${primaryDNS}, ${secondaryDNS}`);
        // 这里可以实现实际的DNS设置保存逻辑
    }

    testDNSConnection() {
        this.showNotification('正在测试DNS连接...');
        // 模拟测试过程
        setTimeout(() => {
            this.showNotification('DNS连接测试成功');
        }, 2000);
    }

    // 加载Swap内存信息
    loadSwapMemoryInfo() {
        // 从系统信息API获取Swap信息并更新显示
        this.loadSystemInfo().then(() => {
            // 系统信息加载完成后更新Swap显示
            this.updateSwapDisplay();
        });
    }

    updateSwapDisplay() {
        // 这个方法会在loadSystemInfo中的updateSystemInfo方法中被调用
        // 因为Swap信息已经包含在系统信息API中
    }

    // 加载到期设置
    loadExpirySettings() {
        this.setupExpiryEvents();
    }

    setupExpiryEvents() {
        const expiryButtons = document.querySelectorAll('.expiry-button');
        expiryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification('到期设置功能开发中...');
            });
        });
    }

    // 加载许可证信息
    loadLicenseInfo() {
        this.setupLicenseEvents();
    }

    setupLicenseEvents() {
        const licenseButtons = document.querySelectorAll('.license-button');
        licenseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification('许可证管理功能开发中...');
            });
        });
    }

    async loadSystemInfo() {
        // 系统信息加载已在HTML中处理，这里不再重复加载
        console.log('系统信息加载由HTML中的脚本处理');
    }

    // 系统信息相关方法已移至HTML中处理

    formatBytes(bytes) {
        // 检查输入是否有效
        if (bytes === null || bytes === undefined || isNaN(bytes)) {
            return '0 B';
        }
        
        // 转换为数字
        const numBytes = Number(bytes);
        if (numBytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(numBytes) / Math.log(k));
        
        return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatUptimeDays(seconds) {
        const days = Math.floor(seconds / 86400);
        return days.toString();
    }

    toggleMaximize() {
        const window = document.querySelector('.window');
        if (window.classList.contains('maximized')) {
            window.classList.remove('maximized');
            window.style.width = '80%';
            window.style.height = '80%';
            window.style.top = '10%';
            window.style.left = '10%';
        } else {
            window.classList.add('maximized');
            window.style.width = '100vw';
            window.style.height = '100vh';
            window.style.top = '0';
            window.style.left = '0';
        }
    }

    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
            </div>
        `;

        // 添加通知样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 122, 255, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 8px;
            padding: 12px 16px;
            color: white;
            font-size: 13px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        // 添加动画样式
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 3000);
    }

    destroy() {
        // 清理资源
        console.log('SystemInfoManager 已销毁');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.systemInfoManager = new SystemInfoManager();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.systemInfoManager) {
        window.systemInfoManager.destroy();
    }
});