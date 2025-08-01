class SettingsManager {
    constructor() {
        console.log('SettingsManager constructor called');
        this.initialized = false;
        // Wait for global settings to be ready
        this.waitForGlobalSettings();
    }
    
    waitForGlobalSettings() {
        console.log('Waiting for global settings...');
        const checkGlobalSettings = () => {
            if (window.globalSettings) {
                console.log('Global settings found, initializing...');
                this.init();
            } else {
                console.log('Global settings not ready, retrying in 50ms');
                setTimeout(checkGlobalSettings, 50);
            }
        };
        checkGlobalSettings();
    }
    
    init() {
        if (this.initialized) {
            console.log('SettingsManager already initialized, skipping');
            return;
        }
        
        try {
            console.log('Starting SettingsManager initialization...');
            this.globalSettings = window.globalSettings;
            this.settings = this.globalSettings.getAllSettings();
            console.log('Settings Manager initialized with settings:', this.settings);
            
            this.initializeElements();
            this.syncUIWithSettings(); // Read current UI state first
            this.bindEvents();
            this.applySettings();
            
            this.initialized = true;
            console.log('SettingsManager initialization complete');
            
            // Listen for settings changes from other sources
            window.addEventListener('settingsChanged', (e) => {
                this.settings = e.detail.allSettings;
                this.updateUIFromSettings();
            });
            
            // Listen for page visibility changes to refresh settings
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.refreshSettingsFromGlobal();
                }
            });
            
            // Listen for storage changes from other tabs
            window.addEventListener('storage', (e) => {
                if (e.key === 'speedsolverx_settings') {
                    this.refreshSettingsFromGlobal();
                }
            });
            
            console.log('Settings Manager fully initialized');
        } catch (error) {
            console.error('Error initializing Settings Manager:', error);
        }
    }
    
    syncUIWithSettings() {
        try {
            // Read current UI state and sync with settings
            Object.keys(this.elements).forEach(key => {
                if (key.includes('Toggle') && this.elements[key]) {
                    const settingKey = key.replace('Toggle', '');
                    const isChecked = this.elements[key].checked;
                    // If setting differs from UI, update the setting to match UI
                    if (this.settings[settingKey] !== isChecked) {
                        console.log(`Syncing ${settingKey}: ${this.settings[settingKey]} -> ${isChecked}`);
                        this.settings[settingKey] = isChecked;
                        this.globalSettings.updateSetting(settingKey, isChecked);
                    }
                }
            });
            
            // Sync input values
            if (this.elements.scrambleLengthInput) {
                const value = parseInt(this.elements.scrambleLengthInput.value);
                if (this.settings.scrambleLength !== value) {
                    this.settings.scrambleLength = value;
                    this.globalSettings.updateSetting('scrambleLength', value);
                }
            }
            
            if (this.elements.cubeTypeSelect) {
                const value = this.elements.cubeTypeSelect.value;
                if (this.settings.cubeType !== value) {
                    this.settings.cubeType = value;
                    this.globalSettings.updateSetting('cubeType', value);
                }
            }
            
            console.log('UI synced with settings:', this.settings);
        } catch (error) {
            console.error('Error syncing UI with settings:', error);
        }
    }

    refreshSettingsFromGlobal() {
        try {
            this.globalSettings.refreshSettings();
            this.settings = this.globalSettings.getAllSettings();
            this.updateUIFromSettings();
            console.log('Settings refreshed from global:', this.settings);
        } catch (error) {
            console.error('Error refreshing settings:', error);
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
                    console.log(`Binding toggle event for ${key}`);
                    this.elements[key].addEventListener('change', (e) => {
                        const settingKey = key.replace('Toggle', '');
                        console.log(`Toggle changed: ${settingKey} = ${e.target.checked}`);
                        this.updateSetting(settingKey, e.target.checked);
                    });
                }
            });
            
            // Input events
            if (this.elements.scrambleLengthInput) {
                console.log('Binding scrambleLength input event');
                this.elements.scrambleLengthInput.addEventListener('change', (e) => {
                    const value = parseInt(e.target.value);
                    console.log(`Scramble length changed: ${value}`);
                    this.updateSetting('scrambleLength', value);
                });
            }
            
            if (this.elements.cubeTypeSelect) {
                console.log('Binding cubeType select event');
                this.elements.cubeTypeSelect.addEventListener('change', (e) => {
                    console.log(`Cube type changed: ${e.target.value}`);
                    this.updateSetting('cubeType', e.target.value);
                });
            }
            
            // Button events
            if (this.elements.exportDataBtn) {
                console.log('Binding export data button');
                this.elements.exportDataBtn.addEventListener('click', () => {
                    console.log('Export data button clicked');
                    this.exportData();
                });
            }
            if (this.elements.importDataBtn) {
                console.log('Binding import data button');
                this.elements.importDataBtn.addEventListener('click', () => {
                    console.log('Import data button clicked');
                    this.importData();
                });
            }
            if (this.elements.clearStatsBtn) {
                console.log('Binding clear stats button');
                this.elements.clearStatsBtn.addEventListener('click', () => {
                    console.log('Clear stats button clicked');
                    this.clearStats();
                });
            }
            if (this.elements.resetSettingsBtn) {
                console.log('Binding reset settings button');
                this.elements.resetSettingsBtn.addEventListener('click', () => {
                    console.log('Reset settings button clicked');
                    this.resetSettings();
                });
            }
            if (this.elements.saveSettingsBtn) {
                console.log('Binding save settings button');
                this.elements.saveSettingsBtn.addEventListener('click', () => {
                    console.log('Save settings button clicked');
                    this.saveSettings();
                });
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
        // Use global settings to update and persist
        this.globalSettings.updateSetting(key, value);
        this.showNotification(`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} updated!`, 'success');
        
        // Apply the setting immediately
        this.applySingleSetting(key, value);
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
        try {
            // Force save all current settings
            Object.keys(this.settings).forEach(key => {
                this.globalSettings.updateSetting(key, this.settings[key]);
            });
            
            // Refresh settings from global
            this.settings = this.globalSettings.getAllSettings();
            
            // Apply all settings
            this.applySettings();
            
            this.showNotification('All settings saved successfully!', 'success');
            console.log('Settings manually saved:', this.settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }
    
    applySettings() {
        // Apply all settings to UI elements
        this.updateUIFromSettings();
    }
    
    applySingleSetting(key, value) {
        console.log(`Applying setting: ${key} = ${value}`);
        switch (key) {
            case 'darkMode':
                document.body.classList.toggle('dark-mode', value);
                document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light');
                console.log('Dark mode applied:', value, document.body.classList.contains('dark-mode'));
                break;
            case 'largeTimer':
                document.body.classList.toggle('large-timer', value);
                console.log('Large timer applied:', value);
                break;
            case 'milliseconds':
                document.body.classList.toggle('show-milliseconds', value);
                break;
            case 'hideScramble':
                document.body.classList.toggle('hide-scramble', value);
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
                        // Update each setting through the global settings manager
                        Object.keys(data.settings).forEach(key => {
                            if (this.globalSettings.defaultSettings.hasOwnProperty(key)) {
                                this.globalSettings.updateSetting(key, data.settings[key]);
                            }
                        });
                        this.settings = this.globalSettings.getAllSettings();
                        this.updateUIFromSettings();
                    }
                    
                    if (data.solves) {
                        localStorage.setItem('recentSolves', JSON.stringify(data.solves));
                    }
                    
                    this.showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    console.error('Import error:', error);
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
        notification.className = `settings-notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add inline styles for immediate visibility
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 250px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add CSS for slide animation if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .notification-close:hover {
                    opacity: 0.7;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        console.log(`Notification shown: ${message} (${type})`);
    }
    
    // Public methods for other components
    getSetting(key) {
        return this.settings[key];
    }
    
    getAllSettings() {
        return { ...this.settings };
    }
}

// Initialize settings manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, creating SettingsManager');
        window.settingsManager = new SettingsManager();
    });
} else {
    console.log('DOM already loaded, creating SettingsManager immediately');
    window.settingsManager = new SettingsManager();
}
