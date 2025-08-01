class SettingsManager {
    constructor() {
        this.defaultSettings = {
            inspection: false,
            autoScramble: true,
            sound: false,
            holdToStart: true,
            darkMode: false,
            largeTimer: false,
            milliseconds: false,
            hideScramble: false,
            realtimeStats: true,
            pbNotifications: true,
            advancedAverages: false,
            scrambleLength: 20,
            cubeType: '3x3'
        };
        
        this.settings = this.loadSettings();
        this.initializeElements();
        this.bindEvents();
        this.applySettings();
    }
    
    initializeElements() {
        this.elements = {
            inspectionToggle: document.getElementById('inspectionToggle'),
            autoScrambleToggle: document.getElementById('autoScrambleToggle'),
            soundToggle: document.getElementById('soundToggle'),
            holdToStartToggle: document.getElementById('holdToStartToggle'),
            darkModeToggle: document.getElementById('darkModeToggle'),
            largeTimerToggle: document.getElementById('largeTimerToggle'),
            millisecondsToggle: document.getElementById('millisecondsToggle'),
            hideScrambleToggle: document.getElementById('hideScrambleToggle'),
            realtimeStatsToggle: document.getElementById('realtimeStatsToggle'),
            pbNotificationsToggle: document.getElementById('pbNotificationsToggle'),
            advancedAveragesToggle: document.getElementById('advancedAveragesToggle'),
            scrambleLengthInput: document.getElementById('scrambleLengthInput'),
            cubeTypeSelect: document.getElementById('cubeTypeSelect'),
            exportDataBtn: document.getElementById('exportDataBtn'),
            importDataBtn: document.getElementById('importDataBtn'),
            clearStatsBtn: document.getElementById('clearStatsBtn'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn')
        };
    }
    
    bindEvents() {
        // Toggle events
        Object.keys(this.elements).forEach(key => {
            if (key.includes('Toggle')) {
                this.elements[key]?.addEventListener('change', (e) => {
                    const settingKey = key.replace('Toggle', '');
                    this.updateSetting(settingKey, e.target.checked);
                });
            }
        });
        
        // Input events
        this.elements.scrambleLengthInput?.addEventListener('change', (e) => {
            this.updateSetting('scrambleLength', parseInt(e.target.value));
        });
        
        this.elements.cubeTypeSelect?.addEventListener('change', (e) => {
            this.updateSetting('cubeType', e.target.value);
        });
        
        // Button events
        this.elements.exportDataBtn?.addEventListener('click', () => this.exportData());
        this.elements.importDataBtn?.addEventListener('click', () => this.importData());
        this.elements.clearStatsBtn?.addEventListener('click', () => this.clearStats());
        this.elements.resetSettingsBtn?.addEventListener('click', () => this.resetSettings());
        this.elements.saveSettingsBtn?.addEventListener('click', () => this.saveSettings());
    }
    
    loadSettings() {
        const saved = localStorage.getItem('speedsolverx_settings');
        if (saved) {
            try {
                return { ...this.defaultSettings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load settings:', e);
                return { ...this.defaultSettings };
            }
        }
        return { ...this.defaultSettings };
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySingleSetting(key, value);
    }
    
    saveSettings() {
        localStorage.setItem('speedsolverx_settings', JSON.stringify(this.settings));
        this.showNotification('Settings saved successfully!', 'success');
    }
    
    applySettings() {
        // Apply all settings to UI elements
        Object.keys(this.settings).forEach(key => {
            this.applySingleSetting(key, this.settings[key]);
            
            // Update UI elements
            const element = this.elements[key + 'Toggle'] || 
                           this.elements[key + 'Input'] || 
                           this.elements[key + 'Select'];
            
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }
    
    applySingleSetting(key, value) {
        switch (key) {
            case 'darkMode':
                document.body.classList.toggle('dark-mode', value);
                break;
            case 'largeTimer':
                document.body.classList.toggle('large-timer', value);
                break;
            case 'inspection':
                // Update timer component if it exists
                if (window.cubingTimer) {
                    window.cubingTimer.setInspectionEnabled(value);
                }
                break;
            case 'sound':
                // Update audio settings
                if (window.cubingTimer) {
                    window.cubingTimer.setSoundEnabled(value);
                }
                break;
            case 'scrambleLength':
                if (window.cubingTimer) {
                    window.cubingTimer.setScrambleLength(value);
                }
                break;
            case 'cubeType':
                if (window.cubingTimer) {
                    window.cubingTimer.setCubeType(value);
                }
                break;
        }
    }
    
    exportData() {
        const data = {
            settings: this.settings,
            solves: JSON.parse(localStorage.getItem('recentSolves') || '[]'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speedsolverx_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.settings) {
                        this.settings = { ...this.defaultSettings, ...data.settings };
                        this.saveSettings();
                        this.applySettings();
                    }
                    
                    if (data.solves) {
                        localStorage.setItem('recentSolves', JSON.stringify(data.solves));
                    }
                    
                    this.showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    this.showNotification('Failed to import data. Invalid file format.', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    clearStats() {
        if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
            localStorage.removeItem('recentSolves');
            this.showNotification('Statistics cleared successfully!', 'success');
            
            // Refresh the page if on stats page
            if (window.location.pathname === '/stats') {
                window.location.reload();
            }
        }
    }
    
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.applySettings();
            this.showNotification('Settings reset to defaults!', 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    // Public methods for other components
    getSetting(key) {
        return this.settings[key];
    }
    
    getAllSettings() {
        return { ...this.settings };
    }
}

// Initialize settings manager
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
