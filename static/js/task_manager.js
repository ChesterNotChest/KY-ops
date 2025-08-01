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

class TaskManager {
    constructor() {
        this.currentTab = 'performance';
        this.selectedProcesses = [];
        this.processes = [];
        this.updateInterval = null;
        this.sortColumn = 'cpu_percent';
        this.sortDirection = 'desc';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProcesses();
        this.startAutoUpdate();
    }

    setupEventListeners() {
        // 导航标签事件
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // 工具栏按钮事件
        document.getElementById('end-task-btn').addEventListener('click', () => {
            this.endSelectedTasks();
        });

        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refresh();
        });

        // 右键菜单事件
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.process-table tbody tr') || e.target.closest('.process-item')) {
                e.preventDefault();
                this.showContextMenu(e);
            }
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // 表格排序事件
        document.querySelectorAll('.process-table th').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.className.replace('process-', '').replace('-', '_');
                this.sortProcesses(column);
            });
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    switchTab(tabName) {
        // 更新导航状态
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 切换内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    async loadProcesses() {
        try {
            const response = await fetch('/api/processes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const processes = await response.json();
            this.processes = processes;
            
            this.renderProcesses();
            this.updateSidebar();
            this.updateResourceOverview();
            
        } catch (error) {
            console.error('加载进程失败:', error);
            this.showError('加载进程失败: ' + error.message);
        }
    }

    renderProcesses() {
        this.renderPerformanceTable();
        this.renderDetailedTable();
    }

    renderPerformanceTable() {
        const tbody = document.getElementById('process-tbody');
        tbody.innerHTML = '';

        // 按CPU使用率排序并取前20个
        const topProcesses = [...this.processes]
            .sort((a, b) => (b.cpu_percent || 0) - (a.cpu_percent || 0))
            .slice(0, 20);

        topProcesses.forEach((process, index) => {
            const row = this.createProcessRow(process, index);
            tbody.appendChild(row);
        });
    }

    createProcessRow(process, index) {
        const row = document.createElement('tr');
        row.dataset.pid = process.pid;
        row.style.animationDelay = `${index * 0.05}s`;

        const icon = this.getProcessIcon(process);
        const iconClass = this.getProcessIconClass(process);

        row.innerHTML = `
            <td class="process-name">
                <div class="process-icon ${iconClass}">
                    <i class="${icon}"></i>
                </div>
                <span>${process.name || 'Unknown'}</span>
            </td>
            <td class="process-cpu ${this.getCpuHighlightClass(process.cpu_percent)}">${this.formatPercent(process.cpu_percent)}</td>
            <td class="process-memory ${this.getMemoryHighlightClass(process.memory_percent)}">${this.formatPercent(process.memory_percent)}</td>
            <td class="process-network-in highlight-network">${this.formatNetworkSpeed(0)}</td>
            <td class="process-network-out highlight-network">${this.formatNetworkSpeed(0)}</td>
        `;

        // 添加事件监听器
        row.addEventListener('click', (e) => this.selectProcess(e, row));
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.selectProcess(e, row);
            this.showContextMenu(e, process);
        });

        return row;
    }

    renderDetailedTable() {
        const tbody = document.getElementById('detailed-process-tbody');
        tbody.innerHTML = '';

        this.processes.forEach((process, index) => {
            const row = document.createElement('tr');
            row.dataset.pid = process.pid;
            row.style.animationDelay = `${index * 0.02}s`;

            row.innerHTML = `
                <td>${process.name || 'Unknown'}</td>
                <td>${process.pid}</td>
                <td>${this.formatPercent(process.cpu_percent)}</td>
                <td>${this.formatPercent(process.memory_percent)}</td>
                <td>
                    <span class="status-indicator ${this.getStatusClass(process.status)}"></span>
                    ${process.status || 'unknown'}
                </td>
                <td>${process.username || 'unknown'}</td>
            `;

            row.addEventListener('click', (e) => this.selectDetailedProcess(e, row));
            tbody.appendChild(row);
        });
    }

    updateSidebar() {
        const apps = this.processes.filter(p => this.isApplication(p));
        const backgroundProcesses = this.processes.filter(p => !this.isApplication(p));

        // 更新计数
        document.getElementById('app-count').textContent = apps.length;
        document.getElementById('background-count').textContent = backgroundProcesses.length;

        // 更新应用列表
        this.renderSidebarList('app-list', apps.slice(0, 10));
        
        // 更新后台进程列表
        this.renderSidebarList('background-list', backgroundProcesses.slice(0, 10));
    }

    renderSidebarList(containerId, processes) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        processes.forEach(process => {
            const item = document.createElement('div');
            item.className = 'process-item';
            item.dataset.pid = process.pid;

            const icon = this.getProcessIcon(process);
            const iconClass = this.getProcessIconClass(process);

            item.innerHTML = `
                <div class="process-icon ${iconClass}">
                    <i class="${icon}"></i>
                </div>
                <div class="process-name">${process.name || 'Unknown'}</div>
            `;

            item.addEventListener('click', () => this.selectSidebarProcess(item, process));
            container.appendChild(item);
        });
    }

    async updateResourceOverview() {
        try {
            const response = await fetch('/api/performance-data');
            if (!response.ok) return;

            const data = await response.json();
            
            // 更新内存使用率
            document.getElementById('memory-percent').textContent = `${Math.round(data.memory_percent || 0)}%`;
            document.getElementById('memory-detail').textContent = `${this.formatBytes(data.memory_used || 0)} / ${this.formatBytes(data.memory_total || 0)}`;
            
            // 更新CPU使用率
            document.getElementById('cpu-percent').textContent = `${Math.round(data.cpu_average || 0)}%`;
            document.getElementById('cpu-detail').textContent = `${data.cpu_percent ? data.cpu_percent.length : 0} 核心`;
            
            // 更新第二个内存显示（已提交内存）
            document.getElementById('memory-percent-2').textContent = `${Math.round((data.memory_percent || 0) * 0.8)}%`;
            document.getElementById('memory-detail-2').textContent = '已提交';
            
            // 更新磁盘使用率
            const diskActivity = Math.min(100, Math.random() * 30); // 模拟磁盘活动
            document.getElementById('disk-percent').textContent = `${Math.round(diskActivity)}%`;
            document.getElementById('disk-detail').textContent = '活动时间';
            
        } catch (error) {
            console.error('更新资源概览失败:', error);
        }
    }

    getProcessIcon(process) {
        if (this.isApplication(process)) {
            return 'fas fa-window-maximize';
        } else if (this.isSystemProcess(process)) {
            return 'fas fa-cog';
        } else {
            return 'fas fa-circle';
        }
    }

    getProcessIconClass(process) {
        if (this.isApplication(process)) {
            return 'app';
        } else if (this.isSystemProcess(process)) {
            return 'system';
        } else {
            return 'service';
        }
    }

    isApplication(process) {
        const appNames = ['chrome', 'firefox', 'code', 'notepad', 'calculator', '模拟', '计划任务', '应用中心'];
        return appNames.some(name => (process.name || '').toLowerCase().includes(name.toLowerCase()));
    }

    isSystemProcess(process) {
        const systemNames = ['kernel', 'system', 'init', 'kthread', 'ksoftirqd', '防火墙'];
        return systemNames.some(name => (process.name || '').toLowerCase().includes(name.toLowerCase()));
    }

    getStatusClass(status) {
        const statusMap = {
            'running': 'running',
            'sleeping': 'sleeping',
            'stopped': 'stopped',
            'zombie': 'zombie'
        };
        return statusMap[status] || 'running';
    }

    getCpuHighlightClass(cpuPercent) {
        return (cpuPercent || 0) > 50 ? 'highlight-cpu' : '';
    }

    getMemoryHighlightClass(memoryPercent) {
        return (memoryPercent || 0) > 70 ? 'highlight-memory' : '';
    }

    formatPercent(value) {
        return `${Math.round(value || 0)}%`;
    }

    formatNetworkSpeed(bytesPerSecond) {
        if (bytesPerSecond === 0) return '0 MB/s';
        
        const mbps = bytesPerSecond / (1024 * 1024);
        if (mbps < 0.1) return '0 MB/s';
        return `${mbps.toFixed(1)} MB/s`;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    selectProcess(event, row) {
        if (!event.ctrlKey && !event.metaKey) {
            this.clearProcessSelection();
        }

        row.classList.toggle('selected');
        
        if (row.classList.contains('selected')) {
            this.selectedProcesses.push(row);
        } else {
            this.selectedProcesses = this.selectedProcesses.filter(r => r !== row);
        }

        this.updateToolbarState();
    }

    selectDetailedProcess(event, row) {
        this.clearDetailedProcessSelection();
        row.classList.add('selected');
        this.selectedProcesses = [row];
        this.updateToolbarState();
    }

    selectSidebarProcess(item, process) {
        // 清除其他选择
        document.querySelectorAll('.process-item').forEach(i => {
            i.classList.remove('selected');
        });
        
        item.classList.add('selected');
        
        // 在主表格中高亮对应进程
        this.highlightProcessInTable(process.pid);
    }

    highlightProcessInTable(pid) {
        document.querySelectorAll('.process-table tbody tr').forEach(row => {
            row.classList.remove('selected');
            if (row.dataset.pid === pid.toString()) {
                row.classList.add('selected');
            }
        });
    }

    clearProcessSelection() {
        this.selectedProcesses.forEach(row => {
            row.classList.remove('selected');
        });
        this.selectedProcesses = [];
    }

    clearDetailedProcessSelection() {
        document.querySelectorAll('.detailed-process-table tbody tr').forEach(row => {
            row.classList.remove('selected');
        });
    }

    updateToolbarState() {
        const endTaskBtn = document.getElementById('end-task-btn');
        endTaskBtn.disabled = this.selectedProcesses.length === 0;
    }

    sortProcesses(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }

        this.processes.sort((a, b) => {
            let aVal = a[column] || 0;
            let bVal = b[column] || 0;

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.renderProcesses();
    }

    showContextMenu(event, process = null) {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;

        // 确保菜单不会超出屏幕
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${event.pageX - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${event.pageY - rect.height}px`;
        }

        // 添加菜单项点击事件
        contextMenu.querySelectorAll('.menu-item').forEach(item => {
            item.onclick = () => {
                this.handleContextMenuAction(item.dataset.action, process);
                this.hideContextMenu();
            };
        });
    }

    hideContextMenu() {
        document.getElementById('context-menu').style.display = 'none';
    }

    handleContextMenuAction(action, process) {
        switch(action) {
            case 'end-task':
                this.endTask(process);
                break;
            case 'go-to-details':
                this.goToDetails(process);
                break;
            case 'properties':
                this.showProcessProperties(process);
                break;
            default:
                console.log(`执行操作: ${action}`);
        }
    }

    endTask(process) {
        if (process) {
            const confirmed = confirm(`确定要结束进程 "${process.name}" (PID: ${process.pid}) 吗？`);
            if (confirmed) {
                this.showNotification(`结束任务功能开发中...`, 'warning');
                // 这里可以实现实际的结束任务功能
            }
        }
    }

    endSelectedTasks() {
        if (this.selectedProcesses.length > 0) {
            const confirmed = confirm(`确定要结束选中的 ${this.selectedProcesses.length} 个进程吗？`);
            if (confirmed) {
                this.showNotification(`批量结束任务功能开发中...`, 'warning');
                // 这里可以实现实际的批量结束任务功能
            }
        }
    }

    goToDetails(process) {
        this.switchTab('processes');
        // 在详细视图中高亮对应进程
        setTimeout(() => {
            this.highlightProcessInDetailedTable(process.pid);
        }, 100);
    }

    highlightProcessInDetailedTable(pid) {
        document.querySelectorAll('.detailed-process-table tbody tr').forEach(row => {
            row.classList.remove('selected');
            if (row.dataset.pid === pid.toString()) {
                row.classList.add('selected');
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    showProcessProperties(process) {
        if (process) {
            this.showNotification(`进程属性功能开发中...`, 'info');
            // 这里可以实现进程属性对话框
        }
    }

    refresh() {
        this.loadProcesses();
        this.showNotification('已刷新', 'success');
    }

    startAutoUpdate() {
        // 每1秒自动更新一次
        this.updateInterval = setInterval(() => {
            this.loadProcesses();
        }, 1000);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch(event.key) {
                case 'r':
                    event.preventDefault();
                    this.refresh();
                    break;
            }
        } else {
            switch(event.key) {
                case 'Delete':
                    this.endSelectedTasks();
                    break;
                case 'F5':
                    this.refresh();
                    break;
                case 'Escape':
                    this.clearProcessSelection();
                    this.hideContextMenu();
                    break;
            }
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        const colors = {
            info: '#00bcd4',
            error: '#f44336',
            success: '#4caf50',
            warning: '#ff9800'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
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

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'fa-info-circle',
            error: 'fa-exclamation-triangle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-circle'
        };
        return icons[type] || icons.info;
    }

    destroy() {
        this.stopAutoUpdate();
    }
}

// 初始化任务管理器
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.taskManager) {
        window.taskManager.destroy();
    }
});