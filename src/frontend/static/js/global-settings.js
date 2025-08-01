// Global Settings Manager - Applies settings across all pages
class GlobalSettings {
    constructor() {
        this.defaultSettings = {
            inspection: true,
            autoScramble: true,
            sound: true,
            holdToStart: true,
            darkMode: true,
            largeTimer: true,
            hideScramble: false,
            realtimeStats: true,
            pbNotifications: true,
            advancedAverages: true,
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
        // Check if DOM is ready before applying settings
        if (!document.body) {
            console.log('DOM not ready, deferring global settings application');
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.applyGlobalSettings());
            }
            return;
        }
        
        try {
            // Apply visual settings that affect all pages
            this.applyDarkMode();
            this.applyLargeTimer();
            this.applyCustomStyles();
            
            console.log('Global settings applied:', this.settings);
        } catch (error) {
            console.error('Error applying global settings:', error);
        }
        
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
        // Check if document.body exists before trying to access it
        if (!document.body) {
            console.log('Document body not ready, deferring dark mode application');
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.applyDarkMode());
            }
            return;
        }
        
        console.log('Applying dark mode:', this.settings.darkMode);
        console.log('Current body classes before:', document.body.className);
        
        try {
            if (this.settings.darkMode) {
                document.body.classList.add('dark-mode');
                document.documentElement.setAttribute('data-theme', 'dark');
                console.log('Dark mode ENABLED - added dark-mode class');
            } else {
                document.body.classList.remove('dark-mode');
                document.documentElement.setAttribute('data-theme', 'light');
                console.log('Dark mode DISABLED - removed dark-mode class');
            }
            
            console.log('Current body classes after:', document.body.className);
            console.log('Document theme attribute:', document.documentElement.getAttribute('data-theme'));
        } catch (error) {
            console.error('Error applying dark mode:', error);
        }
    }
    
    applyLargeTimer() {
        if (!document.body) {
            console.log('Document body not ready for large timer application');
            return;
        }
        
        try {
            if (this.settings.largeTimer) {
                document.body.classList.add('large-timer');
            } else {
                document.body.classList.remove('large-timer');
            }
        } catch (error) {
            console.error('Error applying large timer setting:', error);
        }
    }
    
    applyCustomStyles() {
        if (!document.body) {
            console.log('Document body not ready for custom styles application');
            return;
        }
        
        try {
            // Apply other visual preferences
            if (this.settings.hideScramble) {
                document.body.classList.add('hide-scramble');
            } else {
                document.body.classList.remove('hide-scramble');
            }
        } catch (error) {
            console.error('Error applying custom styles:', error);
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
        console.log(`GlobalSettings.updateSetting called: ${key} = ${value}`);
        console.log('Previous settings:', this.settings);
        
        this.settings[key] = value;
        localStorage.setItem('speedsolverx_settings', JSON.stringify(this.settings));
        
        console.log('Updated settings:', this.settings);
        console.log('Saved to localStorage:', localStorage.getItem('speedsolverx_settings'));
        
        this.applyGlobalSettings();
        
        // Show notification for setting change
        this.showSettingNotification(key, value);
        
        // Notify other pages of settings change
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { key, value, allSettings: this.settings }
        }));
        
        console.log('Settings change event dispatched');
    }
    
    showSettingNotification(key, value) {
        // Format the setting name nicely
        const settingName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        const status = typeof value === 'boolean' ? (value ? 'enabled' : 'disabled') : `set to ${value}`;
        const message = `${settingName} ${status}`;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'settings-saved-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles for the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
        console.log(`Setting notification shown: ${message}`);
    }
    
    // Method to force refresh settings (useful when switching pages)
    refreshSettings() {
        this.settings = this.loadSettings();
        this.applyGlobalSettings();
    }
}

// Initialize global settings when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing GlobalSettings');
        window.globalSettings = new GlobalSettings();
        
        // Expose settings to global scope for other scripts
        window.getSettings = () => window.globalSettings.getAllSettings();
        window.getSetting = (key) => window.globalSettings.getSetting(key);
        window.updateSetting = (key, value) => window.globalSettings.updateSetting(key, value);
    });
} else {
    console.log('DOM already loaded, initializing GlobalSettings immediately');
    window.globalSettings = new GlobalSettings();
    
    // Expose settings to global scope for other scripts
    window.getSettings = () => window.globalSettings.getAllSettings();
    window.getSetting = (key) => window.globalSettings.getSetting(key);
    window.updateSetting = (key, value) => window.globalSettings.updateSetting(key, value);
}

// Auto-refresh settings when page becomes visible (for better cross-tab sync)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        window.globalSettings.refreshSettings();
    }
});
