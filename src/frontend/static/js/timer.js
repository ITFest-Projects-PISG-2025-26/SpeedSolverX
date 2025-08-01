class CubingTimer {
    constructor() {
        this.startTime = null;
        this.interval = null;
        this.inspectionInterval = null;
        this.inspectionTime = 15;
        this.currentScramble = '';
        this.solves = JSON.parse(localStorage.getItem('recentSolves') || '[]');
        this.isRunning = false;
        this.isInspecting = false;
        this.keyPressed = false;
        this.holdTimer = null;
        
        // Settings integration
        this.settings = {
            inspection: false,
            autoScramble: true,
            sound: false,
            holdToStart: true,
            scrambleLength: 20,
            cubeType: '3x3'
        };
        
        this.loadSettings();
        this.initializeElements();
        this.bindEvents();
        this.loadRecentSolves();
    }
    
    loadSettings() {
        if (window.settingsManager) {
            this.settings = window.settingsManager.getAllSettings();
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('speedsolverx_settings');
            if (saved) {
                try {
                    this.settings = { ...this.settings, ...JSON.parse(saved) };
                } catch (e) {
                    console.error('Failed to load settings:', e);
                }
            }
        }
    }
    
    initializeElements() {
        this.timerElement = document.getElementById('timer');
        this.inspectionElement = document.getElementById('inspectionTimer');
        this.scrambleElement = document.getElementById('scrambleDisplay');
        this.newScrambleBtn = document.getElementById('newScrambleBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.plus2Btn = document.getElementById('plus2Btn');
        this.dnfBtn = document.getElementById('dnfBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.solvesListElement = document.getElementById('solvesList');
    }
    
    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Button events
        this.newScrambleBtn?.addEventListener('click', () => this.generateNewScramble());
        this.resetBtn?.addEventListener('click', () => this.resetTimer());
        this.plus2Btn?.addEventListener('click', () => this.applyPenalty('plus2'));
        this.dnfBtn?.addEventListener('click', () => this.applyPenalty('dnf'));
        this.deleteBtn?.addEventListener('click', () => this.deleteLastSolve());
        
        // Generate initial scramble
        this.generateNewScramble();
    }
    
    handleKeyDown(e) {
        if (e.code === 'Space' && !this.keyPressed) {
            e.preventDefault();
            this.keyPressed = true;
            
            if (this.isRunning) {
                this.stopTimer();
            } else if (this.isInspecting) {
                this.startMainTimer();
            } else {
                // Start hold timer for reset/start
                if (this.settings.holdToStart) {
                    this.holdTimer = setTimeout(() => {
                        if (this.settings.inspection) {
                            this.startInspection();
                        } else {
                            this.startMainTimer();
                        }
                    }, 100);
                    
                    this.timerElement.style.color = '#f39c12';
                } else {
                    if (this.settings.inspection) {
                        this.startInspection();
                    } else {
                        this.startMainTimer();
                    }
                }
            }
        }
    }
    
    handleKeyUp(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            this.keyPressed = false;
            
            if (this.holdTimer) {
                clearTimeout(this.holdTimer);
                this.holdTimer = null;
            }
            
            if (!this.isRunning && !this.isInspecting) {
                this.timerElement.style.color = '#333';
            }
        }
    }
    
    startInspection() {
        this.isInspecting = true;
        this.inspectionTime = 15;
        this.inspectionElement.style.display = 'block';
        this.inspectionElement.textContent = this.inspectionTime;
        this.timerElement.classList.add('inspection');
        
        if (this.settings.hideScramble) {
            this.scrambleElement.style.opacity = '0.3';
        }
        
        this.inspectionInterval = setInterval(() => {
            this.inspectionTime--;
            this.inspectionElement.textContent = this.inspectionTime;
            
            if (this.inspectionTime <= 0) {
                // Auto-start timer and apply DNF
                clearInterval(this.inspectionInterval);
                this.isInspecting = false;
                this.inspectionElement.style.display = 'none';
                this.timerElement.classList.remove('inspection');
                
                // Start the main timer automatically
                this.startMainTimer();
                
                // Mark as DNF for exceeding inspection time
                this.currentPenalty = 'dnf';
                this.timerElement.classList.add('dnf');
                
                if (this.settings.sound) {
                    this.playSound('error');
                }
            } else if (this.inspectionTime <= 3) {
                // Warning for last 3 seconds
                this.inspectionElement.style.color = '#e74c3c';
                if (this.settings.sound) {
                    this.playSound('warning');
                }
            }
        }, 1000);
    }
    
    startMainTimer() {
        if (this.isInspecting) {
            clearInterval(this.inspectionInterval);
            this.inspectionElement.style.display = 'none';
            this.isInspecting = false;
            this.timerElement.classList.remove('inspection');
            
            if (this.settings.hideScramble) {
                this.scrambleElement.style.opacity = '0.1';
            }
        }
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.timerElement.classList.add('running');
        
        if (this.settings.sound) {
            this.playSound('start');
        }
        
        this.interval = setInterval(() => {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const precision = this.settings.milliseconds ? 3 : 2;
            this.timerElement.textContent = elapsed.toFixed(precision);
        }, 10);
    }
    
    stopTimer() {
        if (!this.isRunning) return;
        
        clearInterval(this.interval);
        this.isRunning = false;
        
        const finalTime = (Date.now() - this.startTime) / 1000;
        this.timerElement.classList.remove('running');
        
        if (this.settings.hideScramble) {
            this.scrambleElement.style.opacity = '1';
        }
        
        if (this.settings.sound) {
            this.playSound('stop');
        }
        
        // Apply inspection penalty if applicable
        let penalty = null;
        if (this.settings.inspection && this.inspectionTime <= 0 && this.inspectionTime > -2) {
            penalty = 'plus2';
        }
        
        this.recordSolve(finalTime, penalty);
        
        if (this.settings.autoScramble) {
            this.generateNewScramble();
        }
    }
    
    resetTimer() {
        clearInterval(this.interval);
        clearInterval(this.inspectionInterval);
        
        this.isRunning = false;
        this.isInspecting = false;
        this.inspectionTime = 15;
        
        this.timerElement.textContent = '0.00';
        this.timerElement.className = 'timer';
        this.inspectionElement.style.display = 'none';
        this.inspectionElement.style.color = '#e74c3c';
        
        if (this.scrambleElement) {
            this.scrambleElement.style.opacity = '1';
        }
    }
    
    async generateNewScramble() {
        try {
            const response = await fetch('/api/scramble');
            const data = await response.json();
            this.currentScramble = data.scramble;
            this.scrambleElement.textContent = this.currentScramble;
        } catch (error) {
            console.error('Failed to generate scramble:', error);
            this.currentScramble = this.generateLocalScramble();
            this.scrambleElement.textContent = this.currentScramble;
        }
    }
    
    generateLocalScramble() {
        const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
        const modifiers = ['', "'", '2'];
        const scramble = [];
        let lastMove = null;
        
        const length = this.settings.scrambleLength || 20;
        
        for (let i = 0; i < length; i++) {
            let move = moves[Math.floor(Math.random() * moves.length)];
            while (move === lastMove) {
                move = moves[Math.floor(Math.random() * moves.length)];
            }
            
            const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            scramble.push(move + modifier);
            lastMove = move;
        }
        
        return scramble.join(' ');
    }
    
    playSound(type) {
        // Simple beep sounds using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'start':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                break;
            case 'stop':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                break;
            case 'warning':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    recordSolve(time, penalty = null) {
        const solve = {
            time: time,
            scramble: this.currentScramble,
            timestamp: new Date().toISOString(),
            dnf: penalty === 'dnf',
            plus2: penalty === 'plus2'
        };
        
        this.solves.unshift(solve);
        
        // Keep only last 100 solves locally
        if (this.solves.length > 100) {
            this.solves = this.solves.slice(0, 100);
        }
        
        localStorage.setItem('recentSolves', JSON.stringify(this.solves));
        this.loadRecentSolves();
        
        // Send to server
        this.sendSolveToServer(solve);
    }
    
    async sendSolveToServer(solve) {
        try {
            await fetch('/api/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(solve)
            });
        } catch (error) {
            console.error('Failed to save solve to server:', error);
        }
    }
    
    applyPenalty(type) {
        if (this.solves.length === 0) return;
        
        const lastSolve = this.solves[0];
        
        if (type === 'plus2') {
            lastSolve.plus2 = !lastSolve.plus2;
            lastSolve.dnf = false;
        } else if (type === 'dnf') {
            lastSolve.dnf = !lastSolve.dnf;
            lastSolve.plus2 = false;
        }
        
        localStorage.setItem('recentSolves', JSON.stringify(this.solves));
        this.loadRecentSolves();
        this.sendSolveToServer(lastSolve);
    }
    
    deleteLastSolve() {
        if (this.solves.length === 0) return;
        
        if (confirm('Delete the last solve?')) {
            this.solves.shift();
            localStorage.setItem('recentSolves', JSON.stringify(this.solves));
            this.loadRecentSolves();
        }
    }
    
    loadRecentSolves() {
        if (!this.solvesListElement) return;
        
        if (this.solves.length === 0) {
            this.solvesListElement.innerHTML = '<p>No solves yet. Start timing!</p>';
            return;
        }
        
        const recentSolves = this.solves.slice(0, 10);
        let html = '';
        
        recentSolves.forEach((solve, index) => {
            const timeDisplay = this.formatSolveTime(solve);
            const scramblePreview = solve.scramble.length > 30 ? 
                solve.scramble.substring(0, 30) + '...' : solve.scramble;
            
            html += `
                <div class="solve-item">
                    <span class="solve-time ${this.getSolveTimeClass(solve, index)}">${timeDisplay}</span>
                    <span class="solve-scramble">${scramblePreview}</span>
                    <span class="solve-date">${new Date(solve.timestamp).toLocaleTimeString()}</span>
                </div>
            `;
        });
        
        this.solvesListElement.innerHTML = html;
    }
    
    formatSolveTime(solve) {
        if (solve.dnf) {
            return `DNF(${solve.time.toFixed(2)})`;
        } else if (solve.plus2) {
            return `${(solve.time + 2).toFixed(2)}+`;
        } else {
            return solve.time.toFixed(2);
        }
    }
    
    getSolveTimeClass(solve, index) {
        let classes = '';
        
        if (solve.dnf) {
            classes += 'dnf ';
        } else if (solve.plus2) {
            classes += 'plus2 ';
        }
        
        // Mark personal best
        if (index === 0 && this.solves.length > 1) {
            const validTimes = this.solves
                .filter(s => !s.dnf)
                .map(s => s.plus2 ? s.time + 2 : s.time);
            
            const currentTime = solve.plus2 ? solve.time + 2 : solve.time;
            const bestTime = Math.min(...validTimes);
            
            if (currentTime === bestTime && !solve.dnf) {
                classes += 'best ';
            }
        }
        
        return classes.trim();
    }
}

// Initialize timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CubingTimer();
});
