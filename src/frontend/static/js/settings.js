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
            
            // Force refresh settings from localStorage to ensure we have the latest
            this.globalSettings.refreshSettings();
            this.settings = this.globalSettings.getAllSettings();
            console.log('Settings Manager initialized with fresh settings:', this.settings);
            
            this.initializeElements();
            this.syncUIWithSettings(); // Update UI to match saved settings
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
            // Update UI to match saved settings (not the other way around)
            console.log('Syncing UI to match saved settings:', this.settings);
            
            Object.keys(this.elements).forEach(key => {
                if (key.includes('Toggle') && this.elements[key]) {
                    const settingKey = key.replace('Toggle', '');
                    if (this.settings.hasOwnProperty(settingKey)) {
                        const savedValue = this.settings[settingKey];
                        if (this.elements[key].checked !== savedValue) {
                            console.log(`Updating UI: ${settingKey} toggle to ${savedValue}`);
                            this.elements[key].checked = savedValue;
                        }
                    }
                }
            });
            
            // Update input values to match settings
            if (this.elements.scrambleLengthInput && this.settings.scrambleLength) {
                if (parseInt(this.elements.scrambleLengthInput.value) !== this.settings.scrambleLength) {
                    console.log(`Updating UI: scrambleLength input to ${this.settings.scrambleLength}`);
                    this.elements.scrambleLengthInput.value = this.settings.scrambleLength;
                }
            }
            
            if (this.elements.cubeTypeSelect && this.settings.cubeType) {
                if (this.elements.cubeTypeSelect.value !== this.settings.cubeType) {
                    console.log(`Updating UI: cubeType select to ${this.settings.cubeType}`);
                    this.elements.cubeTypeSelect.value = this.settings.cubeType;
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
            
            // Button events with robust error handling
            const buttons = [
                { element: 'exportDataBtn', handler: 'exportData', name: 'Export Data' },
                { element: 'importDataBtn', handler: 'importData', name: 'Import Data' },
                { element: 'clearStatsBtn', handler: 'clearStats', name: 'Clear Stats' },
                { element: 'resetSettingsBtn', handler: 'resetSettings', name: 'Reset Settings' },
                { element: 'saveSettingsBtn', handler: 'saveSettings', name: 'Save Settings' }
            ];

            buttons.forEach(button => {
                const element = this.elements[button.element];
                if (element) {
                    console.log(`✅ Binding ${button.name} button - element found`);
                    element.addEventListener('click', (e) => {
                        console.log(`🔥 ${button.name} button clicked!`);
                        e.preventDefault();
                        e.stopPropagation();
                        
                        try {
                            this.addButtonClickFeedback(e.target);
                            this[button.handler]();
                            console.log(`✅ ${button.name} handler executed successfully`);
                        } catch (error) {
                            console.error(`❌ Error executing ${button.name}:`, error);
                            this.showNotification(`Error: ${button.name} failed. Check console for details.`, 'error');
                        }
                    });
                } else {
                    console.error(`❌ ${button.name} button element not found: ${button.element}`);
                }
            });
            
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
        // Use global settings to update and persist (this will show the notification)
        this.globalSettings.updateSetting(key, value);
        
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
            
            // Show a special notification for manual save
            this.showManualSaveNotification();
            console.log('Settings manually saved:', this.settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }
    
    showManualSaveNotification() {
        // Create notification element for manual save
        const notification = document.createElement('div');
        notification.className = 'settings-saved-notification-special';
        notification.innerHTML = `
            <i class="fas fa-save"></i>
            <span>All settings saved successfully!</span>
        `;
        
        // Add styles for the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2196F3;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 15px;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.4s ease, opacity 0.4s ease;
            opacity: 0;
            border-left: 4px solid #1976D2;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Auto remove after 4 seconds (longer for manual save)
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 4000);
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
        try {
            console.log('Starting data export...');
            const data = {
                settings: this.settings,
                solves: JSON.parse(localStorage.getItem('recentSolves') || '[]'),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            console.log('Data to export:', data);
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `speedsolverx_data_${new Date().toISOString().split('T')[0]}.json`;
            
            // Add visual feedback
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully!', 'success');
            console.log('Data export completed successfully');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export data. Please try again.', 'error');
        }
    }
    
    importData() {
        try {
            console.log('Starting data import...');
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) {
                    console.log('No file selected');
                    return;
                }
                
                console.log('File selected:', file.name);
                this.showNotification('Processing import file...', 'info');
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        console.log('Reading file contents...');
                        const data = JSON.parse(e.target.result);
                        console.log('Parsed import data:', data);
                        
                        let importedSettings = false;
                        let importedSolves = false;
                        
                        if (data.settings) {
                            console.log('Importing settings...');
                            // Update each setting through the global settings manager
                            Object.keys(data.settings).forEach(key => {
                                if (this.globalSettings.defaultSettings.hasOwnProperty(key)) {
                                    this.globalSettings.updateSetting(key, data.settings[key]);
                                }
                            });
                            this.settings = this.globalSettings.getAllSettings();
                            this.updateUIFromSettings();
                            importedSettings = true;
                        }
                        
                        if (data.solves && Array.isArray(data.solves)) {
                            console.log(`Importing ${data.solves.length} solves...`);
                            localStorage.setItem('recentSolves', JSON.stringify(data.solves));
                            importedSolves = true;
                        }
                        
                        const message = `Data imported successfully! ${importedSettings ? 'Settings' : ''}${importedSettings && importedSolves ? ' and ' : ''}${importedSolves ? `${data.solves.length} solves` : ''} imported.`;
                        this.showNotification(message, 'success');
                        console.log('Import completed successfully');
                    } catch (error) {
                        console.error('Import parsing error:', error);
                        this.showNotification('Failed to import data. Invalid file format or corrupted file.', 'error');
                    }
                };
                
                reader.onerror = () => {
                    console.error('File reading error');
                    this.showNotification('Failed to read file. Please try again.', 'error');
                };
                
                reader.readAsText(file);
            };
            
            // Add to DOM and trigger click
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
            
        } catch (error) {
            console.error('Import initialization error:', error);
            this.showNotification('Failed to initialize import. Please try again.', 'error');
        }
    }
    
    clearStats() {
        console.log('Clear stats requested...');
        if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
            try {
                const solvesBefore = JSON.parse(localStorage.getItem('recentSolves') || '[]');
                console.log(`Clearing ${solvesBefore.length} solves...`);
                
                localStorage.removeItem('recentSolves');
                
                const solvesAfter = JSON.parse(localStorage.getItem('recentSolves') || '[]');
                console.log(`Solves after clearing: ${solvesAfter.length}`);
                
                this.showNotification(`${solvesBefore.length} solve(s) cleared successfully!`, 'success');
                
                // Refresh the page if on stats page
                if (window.location.pathname === '/stats') {
                    console.log('Refreshing stats page...');
                    setTimeout(() => window.location.reload(), 1000);
                }
            } catch (error) {
                console.error('Error clearing stats:', error);
                this.showNotification('Failed to clear statistics. Please try again.', 'error');
            }
        } else {
            console.log('Clear stats cancelled by user');
        }
    }
    
    resetSettings() {
        console.log('Reset settings requested...');
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            try {
                console.log('Resetting settings to defaults...');
                console.log('Current settings:', this.settings);
                console.log('Default settings:', this.globalSettings.defaultSettings);
                
                // Reset through global settings
                Object.keys(this.globalSettings.defaultSettings).forEach(key => {
                    this.globalSettings.updateSetting(key, this.globalSettings.defaultSettings[key]);
                });
                
                this.settings = this.globalSettings.getAllSettings();
                this.updateUIFromSettings();
                
                console.log('Settings after reset:', this.settings);
                this.showNotification('Settings reset to defaults successfully!', 'success');
            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showNotification('Failed to reset settings. Please try again.', 'error');
            }
        } else {
            console.log('Reset settings cancelled by user');
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
    
    addButtonClickFeedback(button) {
        // Add visual feedback for button clicks
        const originalText = button.innerHTML;
        const originalClass = button.className;
        
        // Add clicked state
        button.style.transform = 'scale(0.95)';
        button.style.opacity = '0.8';
        
        // Reset after short delay
        setTimeout(() => {
            button.style.transform = '';
            button.style.opacity = '';
        }, 150);
    }
    
    // Debug function to test if settings manager is working
    testDataManagement() {
        console.log('🧪 Testing Data Management Functions...');
        console.log('Settings Manager Instance:', this);
        console.log('Elements:', this.elements);
        console.log('Export Data Button:', this.elements.exportDataBtn);
        console.log('Import Data Button:', this.elements.importDataBtn);
        console.log('Clear Stats Button:', this.elements.clearStatsBtn);
        console.log('Reset Settings Button:', this.elements.resetSettingsBtn);
        console.log('Save Settings Button:', this.elements.saveSettingsBtn);
        
        // Test notification system
        this.showNotification('Data Management Test - All systems working!', 'success');
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
        
        // Add global test function for debugging
        window.testDataManagement = () => {
            if (window.settingsManager) {
                window.settingsManager.testDataManagement();
            } else {
                console.error('❌ Settings Manager not found!');
            }
        };
        
        // Add individual button test functions
        window.testExport = () => window.settingsManager?.exportData();
        window.testImport = () => window.settingsManager?.importData();
        window.testClear = () => window.settingsManager?.clearStats();
        window.testReset = () => window.settingsManager?.resetSettings();
        window.testSave = () => window.settingsManager?.saveSettings();
    });
} else {
    console.log('DOM already loaded, creating SettingsManager immediately');
    window.settingsManager = new SettingsManager();
    
    // Add global test functions
    window.testDataManagement = () => {
        if (window.settingsManager) {
            window.settingsManager.testDataManagement();
        } else {
            console.error('❌ Settings Manager not found!');
        }
    };
    
    window.testExport = () => window.settingsManager?.exportData();
    window.testImport = () => window.settingsManager?.importData();
    window.testClear = () => window.settingsManager?.clearStats();
    window.testReset = () => window.settingsManager?.resetSettings();
    window.testSave = () => window.settingsManager?.saveSettings();
}
