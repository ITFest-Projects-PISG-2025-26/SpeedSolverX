// Global Settings Manager - Applies settings across all pages
class GlobalSettings {
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
        this.applyGlobalSettings();
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
    
    applyGlobalSettings() {
        // Apply visual settings that affect all pages
        this.applyDarkMode();
        this.applyLargeTimer();
        this.applyCustomStyles();
        
        console.log('Global settings applied:', this.settings);
        
        // Listen for settings changes from other pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'speedsolverx_settings') {
                this.settings = this.loadSettings();
                this.applyGlobalSettings();
                console.log('Settings refreshed from storage change');
            }
        });
    }
    
    applyDarkMode() {
        console.log('Applying dark mode:', this.settings.darkMode);
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.setAttribute('data-theme', 'light');
        }
        console.log('Dark mode classes:', document.body.className);
    }
    
    applyLargeTimer() {
        if (this.settings.largeTimer) {
            document.body.classList.add('large-timer');
        } else {
            document.body.classList.remove('large-timer');
        }
    }
    
    applyCustomStyles() {
        // Apply other visual preferences
        if (this.settings.milliseconds) {
            document.body.classList.add('show-milliseconds');
        } else {
            document.body.classList.remove('show-milliseconds');
        }
        
        if (this.settings.hideScramble) {
            document.body.classList.add('hide-scramble');
        } else {
            document.body.classList.remove('hide-scramble');
        }
    }
    
    // Public methods for other components to use
    getSetting(key) {
        return this.settings[key];
    }
    
    getAllSettings() {
        return { ...this.settings };
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('speedsolverx_settings', JSON.stringify(this.settings));
        this.applyGlobalSettings();
        
        // Notify other pages of settings change
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { key, value, allSettings: this.settings }
        }));
    }
    
    // Method to force refresh settings (useful when switching pages)
    refreshSettings() {
        this.settings = this.loadSettings();
        this.applyGlobalSettings();
    }
}

// Initialize global settings immediately
window.globalSettings = new GlobalSettings();

// Expose settings to global scope for other scripts
window.getSettings = () => window.globalSettings.getAllSettings();
window.getSetting = (key) => window.globalSettings.getSetting(key);
window.updateSetting = (key, value) => window.globalSettings.updateSetting(key, value);

// Auto-refresh settings when page becomes visible (for better cross-tab sync)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        window.globalSettings.refreshSettings();
    }
});
