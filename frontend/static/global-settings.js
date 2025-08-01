// Global Settings Management System
class GlobalSettings {
    constructor() {
        this.settings = {
            darkMode: false,
            largeTimer: false,
            inspection: true,
            autoNext: true,
            timerSize: 'normal',
            colorScheme: 'default'
        };
        
        this.loadSettings();
        this.applySettings();
        this.initializeSettingsSync();
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('speedsolver_settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('speedsolver_settings', JSON.stringify(this.settings));
            this.broadcastSettingsChange();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }

    getSetting(key) {
        return this.settings[key];
    }

    applySettings() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Apply large timer
        if (this.settings.largeTimer) {
            document.body.classList.add('large-timer');
        } else {
            document.body.classList.remove('large-timer');
        }

        // Apply other visual settings
        this.applyVisualSettings();
    }

    applyVisualSettings() {
        // Update CSS custom properties for better theme support
        const root = document.documentElement;
        
        if (this.settings.darkMode) {
            root.style.setProperty('--bg-primary', 'rgba(15, 15, 15, 0.95)');
            root.style.setProperty('--bg-secondary', 'rgba(25, 25, 25, 0.9)');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.8)');
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.2)');
            root.style.setProperty('--accent-color', '#667eea');
        } else {
            root.style.setProperty('--bg-primary', 'rgba(255, 255, 255, 0.95)');
            root.style.setProperty('--bg-secondary', 'rgba(248, 249, 250, 0.9)');
            root.style.setProperty('--text-primary', '#333333');
            root.style.setProperty('--text-secondary', '#666666');
            root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--accent-color', '#667eea');
        }
    }

    broadcastSettingsChange() {
        // Broadcast settings change to other tabs/windows
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: this.settings
        }));
    }

    initializeSettingsSync() {
        // Listen for settings changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'speedsolver_settings') {
                this.loadSettings();
                this.applySettings();
            }
        });

        // Listen for custom settings change events
        window.addEventListener('settingsChanged', (e) => {
            this.settings = { ...this.settings, ...e.detail };
            this.applySettings();
        });
    }

    // Sync settings with page elements
    syncWithPage() {
        // Update toggle switches if they exist
        Object.keys(this.settings).forEach(key => {
            const toggle = document.getElementById(key);
            if (toggle && toggle.type === 'checkbox') {
                toggle.checked = this.settings[key];
            }
        });
    }

    // Initialize settings on any page
    initializePage() {
        document.addEventListener('DOMContentLoaded', () => {
            this.applySettings();
            this.syncWithPage();
            
            // Set up event listeners for settings controls
            this.setupSettingsControls();
        });
    }

    setupSettingsControls() {
        // Set up toggle switches
        document.querySelectorAll('input[type="checkbox"][id]').forEach(toggle => {
            if (this.settings.hasOwnProperty(toggle.id)) {
                toggle.checked = this.settings[toggle.id];
                toggle.addEventListener('change', (e) => {
                    this.updateSetting(toggle.id, e.target.checked);
                });
            }
        });

        // Set up select dropdowns
        document.querySelectorAll('select[id]').forEach(select => {
            if (this.settings.hasOwnProperty(select.id)) {
                select.value = this.settings[select.id];
                select.addEventListener('change', (e) => {
                    this.updateSetting(select.id, e.target.value);
                });
            }
        });
    }
}

// Initialize global settings
window.globalSettings = new GlobalSettings();
window.globalSettings.initializePage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalSettings;
}
