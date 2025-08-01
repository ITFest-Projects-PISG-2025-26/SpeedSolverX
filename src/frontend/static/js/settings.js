class SettingsManager {
    constructor() {
        // Wait for global settings to be ready
        if (window.globalSettings) {
            this.init();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                // Give time for global settings to load
                const checkGlobalSettings = () => {
                    if (window.globalSettings) {
                        this.init();
                    } else {
                        setTimeout(checkGlobalSettings, 50);
                    }
                };
                checkGlobalSettings();
            });
        }
    }
    
    init() {
        try {
            this.globalSettings = window.globalSettings;
            this.settings = this.globalSettings.getAllSettings();
            console.log('Settings Manager initialized with settings:', this.settings);
            
            this.initializeElements();
            this.bindEvents();
            this.applySettings();
            
            // Listen for settings changes from other sources
            window.addEventListener('settingsChanged', (e) => {
                this.settings = e.detail.allSettings;
                this.updateUIFromSettings();
            });
            
            console.log('Settings Manager fully initialized');
        } catch (error) {
            console.error('Error initializing Settings Manager:', error);
        }
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
        
        // Log which elements are found
        console.log('Settings elements initialized:', Object.keys(this.elements).reduce((acc, key) => {
            acc[key] = !!this.elements[key];
            return acc;
        }, {}));
    }
    
    bindEvents() {
        try {
            // Toggle events
            Object.keys(this.elements).forEach(key => {
                if (key.includes('Toggle') && this.elements[key]) {
                    this.elements[key].addEventListener('change', (e) => {
                        const settingKey = key.replace('Toggle', '');
                        this.updateSetting(settingKey, e.target.checked);
                    });
                }
            });
            
            // Input events
            if (this.elements.scrambleLengthInput) {
                this.elements.scrambleLengthInput.addEventListener('change', (e) => {
                    this.updateSetting('scrambleLength', parseInt(e.target.value));
                });
            }
            
            if (this.elements.cubeTypeSelect) {
                this.elements.cubeTypeSelect.addEventListener('change', (e) => {
                    this.updateSetting('cubeType', e.target.value);
                });
            }
            
            // Button events
            if (this.elements.exportDataBtn) {
                this.elements.exportDataBtn.addEventListener('click', () => this.exportData());
            }
            if (this.elements.importDataBtn) {
                this.elements.importDataBtn.addEventListener('click', () => this.importData());
            }
            if (this.elements.clearStatsBtn) {
                this.elements.clearStatsBtn.addEventListener('click', () => this.clearStats());
            }
            if (this.elements.resetSettingsBtn) {
                this.elements.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
            }
            if (this.elements.saveSettingsBtn) {
                this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
            }
            
            console.log('Settings event listeners bound successfully');
        } catch (error) {
            console.error('Error binding settings events:', error);
        }
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
        // Use global settings to update
        this.globalSettings.updateSetting(key, value);
        this.showNotification('Settings saved successfully!', 'success');
    }
    
    updateUIFromSettings() {
        try {
            // Update UI elements when settings change from external source
            Object.keys(this.settings).forEach(key => {
                const toggleElement = this.elements[key + 'Toggle'];
                const inputElement = this.elements[key + 'Input'];
                const selectElement = this.elements[key + 'Select'];
                
                if (toggleElement && toggleElement.type === 'checkbox') {
                    toggleElement.checked = this.settings[key];
                } else if (inputElement) {
                    inputElement.value = this.settings[key];
                } else if (selectElement) {
                    selectElement.value = this.settings[key];
                }
                
                // Apply the setting to the page
                this.applySingleSetting(key, this.settings[key]);
            });
            
            console.log('UI updated from settings:', this.settings);
        } catch (error) {
            console.error('Error updating UI from settings:', error);
        }
    }
    
    saveSettings() {
        // Settings are now saved through global settings
        this.showNotification('Settings saved successfully!', 'success');
    }
    
    applySettings() {
        // Apply all settings to UI elements
        this.updateUIFromSettings();
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
            // Reset through global settings
            Object.keys(this.globalSettings.defaultSettings).forEach(key => {
                this.globalSettings.updateSetting(key, this.globalSettings.defaultSettings[key]);
            });
            this.settings = this.globalSettings.getAllSettings();
            this.updateUIFromSettings();
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
                        Object.keys(data.settings).forEach(key => {
                            this.globalSettings.updateSetting(key, data.settings[key]);
                        });
                        this.settings = this.globalSettings.getAllSettings();
                        this.updateUIFromSettings();
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
