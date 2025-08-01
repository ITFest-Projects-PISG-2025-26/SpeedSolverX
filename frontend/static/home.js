// Home Page JavaScript - Stats and Quick Actions
class HomePageManager {
    constructor() {
        this.stats = {
            totalSolves: 0,
            bestTime: '--:--',
            averageTime: '--:--',
            sessionAvg: '--:--',
            recentSolves: []
        };
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadStats();
            this.updateDisplay();
            this.setupEventListeners();
        });
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                this.stats = {
                    totalSolves: data.total_solves || 0,
                    bestTime: data.best_time || '--:--',
                    averageTime: data.mo3 || '--:--',
                    sessionAvg: data.session_avg || '--:--',
                    recentSolves: data.recent_solves || []
                };
            } else {
                this.useDemoData();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            this.useDemoData();
        }
    }
    
    useDemoData() {
        this.stats = {
            totalSolves: 247,
            bestTime: '12.34',
            averageTime: '18.67',
            sessionAvg: '17.89',
            recentSolves: [
                { time: '15.23', date: '2025-08-01 10:30' },
                { time: '19.87', date: '2025-08-01 10:25' },
                { time: '17.45', date: '2025-08-01 10:20' },
                { time: '22.11', date: '2025-08-01 10:15' },
                { time: '16.89', date: '2025-08-01 10:10' }
            ]
        };
    }
    
    updateDisplay() {
        // Update quick stats
        const elements = {
            totalSolves: document.getElementById('totalSolves'),
            bestTime: document.getElementById('bestTime'),
            averageTime: document.getElementById('averageTime'),
            sessionAvg: document.getElementById('sessionAvg')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = this.stats[key];
            }
        });

        this.updateRecentActivity();
    }
    
    updateRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        activityList.innerHTML = '';

        if (this.stats.recentSolves.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-time">No solves yet</div>
                    <div class="activity-date">Start timing to see activity</div>
                </div>
            `;
            return;
        }

        this.stats.recentSolves.forEach(solve => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const timeDate = new Date(solve.date);
            const formattedTime = timeDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            activityItem.innerHTML = `
                <div class="activity-time">${solve.time}s</div>
                <div class="activity-date">${formattedTime}</div>
            `;
            
            activityList.appendChild(activityItem);
        });
    }
    
    setupEventListeners() {
        // Feature card navigation
        document.querySelectorAll('.feature-card').forEach(card => {
            const onclickAttr = card.getAttribute('onclick');
            if (onclickAttr) {
                card.removeAttribute('onclick');
                const match = onclickAttr.match(/window\.location\.href='([^']+)'/);
                if (match) {
                    card.addEventListener('click', () => {
                        window.location.href = match[1];
                    });
                }
            }
            
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Add hover effects
        document.querySelectorAll('.stat-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-3px)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
            });
        });
        
        // Refresh on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshStats();
            }
        });
    }
    
    async refreshStats() {
        await this.loadStats();
        this.updateDisplay();
    }
}

// Initialize home page
window.homePageManager = new HomePageManager();
