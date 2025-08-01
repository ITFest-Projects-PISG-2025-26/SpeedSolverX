// Cube Solver Class
class CubeSolver {
    constructor() {
        this.selectedColor = 'blue';
        this.currentFaceIndex = 0;
        this.faceOrder = ['blue', 'green', 'red', 'orange', 'yellow', 'white'];
        this.cubeState = {
            blue: new Array(9).fill('blue'),
            green: new Array(9).fill('green'),
            red: new Array(9).fill('red'),
            orange: new Array(9).fill('orange'),
            yellow: new Array(9).fill('yellow'),
            white: new Array(9).fill('white')
        };
        
        this.faceNames = {
            blue: 'Blue Face (Front)',
            green: 'Green Face (Back)',
            red: 'Red Face (Right)',
            orange: 'Orange Face (Left)',
            yellow: 'Yellow Face (Top)',
            white: 'White Face (Bottom)'
        };
        
        this.colorMap = {
            white: '#ffffff',
            yellow: '#ffff00',
            blue: '#0066cc',
            green: '#00cc00',
            red: '#cc0000',
            orange: '#ff6600'
        };

        this.cube3DViewer = null;
        this.live3DViewer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateCubeFace();
        this.updateFaceDisplay();
        this.updateProgressIndicator();
        
        // Initialize live 3D viewer since visual input is default
        setTimeout(() => {
            this.initLive3DViewer();
        }, 100);
    }

    setupEventListeners() {
        try {
            // Input method switching
            const visualBtn = document.getElementById('visualInputBtn');
            const view3DBtn = document.getElementById('view3DBtn');
            
            if (visualBtn) visualBtn.addEventListener('click', () => this.switchInputMethod('visual'));
            if (view3DBtn) {
                view3DBtn.addEventListener('click', () => {
                    console.log('3D View button clicked!');
                    this.switchInputMethod('threeD');
                });
            }

            // Color palette
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
            });

            // Face navigation
            const prevBtn = document.getElementById('prevFaceBtn');
            const nextBtn = document.getElementById('nextFaceBtn');
            console.log('Navigation buttons found:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn });
            if (prevBtn) prevBtn.addEventListener('click', () => this.previousFace());
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextFace());

            // Control buttons
            const resetFaceBtn = document.getElementById('resetFaceBtn');
            const solveCubeBtn = document.getElementById('solveCubeBtn');
            if (resetFaceBtn) resetFaceBtn.addEventListener('click', () => this.resetCurrentFace());
            if (solveCubeBtn) solveCubeBtn.addEventListener('click', () => this.solveCube());

            // Solution controls
            const copySolutionBtn = document.getElementById('copySolutionBtn');
            const newSolveBtn = document.getElementById('newSolveBtn');
            
            if (copySolutionBtn) {
                copySolutionBtn.addEventListener('click', () => this.copySolution());
            }
            
            if (newSolveBtn) {
                newSolveBtn.addEventListener('click', () => this.newSolve());
            }

            // 3D viewer controls
            const resetViewBtn = document.getElementById('resetViewBtn');
            if (resetViewBtn) {
                resetViewBtn.addEventListener('click', () => {
                    if (this.cube3DViewer) {
                        this.cube3DViewer.resetView();
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    switchInputMethod(method) {
        console.log('Switching input method to:', method);
        
        // Update button states
        document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
        
        if (method === 'threeD') {
            document.getElementById('view3DBtn').classList.add('active');
        } else {
            document.getElementById(`${method}InputBtn`).classList.add('active');
        }

        // Show/hide sections
        document.querySelectorAll('.input-section').forEach(section => section.classList.remove('active'));
        
        if (method === 'threeD') {
            const threeDSection = document.getElementById('threeDViewSection');
            console.log('3D section element:', threeDSection);
            threeDSection.classList.add('active');
            this.init3DViewer();
        } else {
            document.getElementById(`${method}InputSection`).classList.add('active');
            
            // Initialize live 3D viewer for visual input
            if (method === 'visual') {
                this.initLive3DViewer();
            }
        }
    }

    init3DViewer() {
        console.log('init3DViewer called');
        if (!this.cube3DViewer) {
            const container = document.getElementById('threeDViewer');
            console.log('3D container element:', container);
            console.log('THREE.js available:', !!window.THREE);
            console.log('Cube3DViewer available:', typeof Cube3DViewer);
            
            if (container && window.THREE && typeof Cube3DViewer !== 'undefined') {
                console.log('Creating new Cube3DViewer');
                this.cube3DViewer = new Cube3DViewer(container);
                this.update3DView();
            } else {
                console.error('Missing dependencies:', {
                    container: !!container,
                    THREE: !!window.THREE,
                    Cube3DViewer: typeof Cube3DViewer !== 'undefined'
                });
            }
        } else {
            console.log('3D viewer already exists, updating view');
            this.update3DView();
        }
    }

    initLive3DViewer() {
        console.log('initLive3DViewer called');
        if (!this.live3DViewer) {
            const container = document.getElementById('live3DViewer');
            console.log('Live 3D container element:', container);
            
            if (container && window.THREE && typeof Cube3DViewer !== 'undefined') {
                console.log('Creating new Live Cube3DViewer');
                this.live3DViewer = new Cube3DViewer(container);
                this.updateLive3DView();
                
                // Add reset button functionality
                const resetBtn = document.getElementById('resetLiveViewBtn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        if (this.live3DViewer) {
                            this.live3DViewer.resetView();
                        }
                    });
                }
            } else {
                console.error('Missing dependencies for live 3D viewer:', {
                    container: !!container,
                    THREE: !!window.THREE,
                    Cube3DViewer: typeof Cube3DViewer !== 'undefined'
                });
            }
        } else {
            console.log('Live 3D viewer already exists, updating view');
            this.updateLive3DView();
        }
    }

    updateLive3DView() {
        if (this.live3DViewer) {
            this.live3DViewer.updateCubeState(this.cubeState);
        }
    }

    update3DView() {
        // Update main 3D viewer
        if (this.cube3DViewer) {
            this.cube3DViewer.updateCubeState(this.cubeState);
        }
        
        // Update live 3D viewer
        this.updateLive3DView();
    }

    selectColor(color) {
        this.selectedColor = color;
        
        // Update color palette
        document.querySelectorAll('.color-option').forEach(option => option.classList.remove('active'));
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        
        // Update selected color display
        document.getElementById('selectedColorName').textContent = color.charAt(0).toUpperCase() + color.slice(1);
    }

    generateCubeFace() {
        const cubeFace = document.getElementById('cubeFace');
        if (!cubeFace) {
            console.error('cubeFace element not found!');
            return;
        }
        
        cubeFace.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const square = document.createElement('div');
            square.className = 'cube-square';
            square.dataset.position = i;
            
            // Set initial color
            const currentFace = this.faceOrder[this.currentFaceIndex];
            square.style.backgroundColor = this.colorMap[this.cubeState[currentFace][i]];
            
            // Add click listener
            square.addEventListener('click', () => this.setSquareColor(square, i));
            
            cubeFace.appendChild(square);
        }
    }

    setSquareColor(square, position) {
        const currentFace = this.faceOrder[this.currentFaceIndex];
        
        // Don't allow changing center square
        if (position === 4) return;
        
        square.style.backgroundColor = this.colorMap[this.selectedColor];
        this.cubeState[currentFace][position] = this.selectedColor;
        
        // Add visual feedback
        square.classList.add('square-updated');
        setTimeout(() => square.classList.remove('square-updated'), 300);
        
        // Update 3D view
        this.update3DView();
    }

    updateFaceDisplay() {
        const currentFace = this.faceOrder[this.currentFaceIndex];
        
        // Update face name
        const faceNameElement = document.getElementById('currentFaceName');
        if (faceNameElement) {
            faceNameElement.textContent = this.faceNames[currentFace];
        }
        
        // Update face counter
        const faceCounterElement = document.getElementById('faceCounter');
        if (faceCounterElement) {
            faceCounterElement.textContent = `${this.currentFaceIndex + 1} / 6`;
        }
        
        // Update navigation button states
        const prevBtn = document.getElementById('prevFaceBtn');
        const nextBtn = document.getElementById('nextFaceBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentFaceIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentFaceIndex === 5;
        }
        
        // Update face colors
        const squares = document.querySelectorAll('.cube-square');
        squares.forEach((square, index) => {
            square.style.backgroundColor = this.colorMap[this.cubeState[currentFace][index]];
        });
    }

    updateProgressIndicator() {
        // Update progress steps
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === this.currentFaceIndex);
            step.classList.toggle('completed', index < this.currentFaceIndex);
        });
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progressPercent = ((this.currentFaceIndex + 1) / 6) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }
        
        // Show solve button when all faces are set
        const solveCubeBtn = document.getElementById('solveCubeBtn');
        if (solveCubeBtn) {
            solveCubeBtn.style.display = this.currentFaceIndex === 5 ? 'inline-block' : 'none';
        }
    }

    previousFace() {
        console.log('previousFace called, currentFaceIndex:', this.currentFaceIndex);
        if (this.currentFaceIndex > 0) {
            this.currentFaceIndex--;
            console.log('Moving to face:', this.currentFaceIndex);
            this.updateFaceDisplay();
            this.updateProgressIndicator();
            this.update3DView();
        } else {
            console.log('Already at first face');
        }
    }

    nextFace() {
        console.log('nextFace called, currentFaceIndex:', this.currentFaceIndex);
        if (this.currentFaceIndex < 5) {
            this.currentFaceIndex++;
            console.log('Moving to face:', this.currentFaceIndex);
            this.updateFaceDisplay();
            this.updateProgressIndicator();
            this.update3DView();
        } else {
            console.log('Already at last face');
        }
    }

    resetCurrentFace() {
        const currentFace = this.faceOrder[this.currentFaceIndex];
        
        // Reset to default color (keep center square as face color)
        for (let i = 0; i < 9; i++) {
            if (i === 4) {
                this.cubeState[currentFace][i] = currentFace;
            } else {
                this.cubeState[currentFace][i] = currentFace;
            }
        }
        
        this.updateFaceDisplay();
        this.update3DView();
    }

    async solveCube() {
        try {
            console.log('Sending cube state to server:', this.cubeState);
            
            const response = await fetch('/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cube_state: this.cubeState })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Server response:', result);
            
            if (result.success) {
                this.displaySolution(result.solution, result.move_count);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error solving cube:', error);
            alert('Failed to solve cube. Please check your internet connection and try again.');
        }
    }

    displaySolution(solution, moveCount) {
        // Show solution section
        const solutionSection = document.getElementById('solutionSection');
        if (solutionSection) {
            solutionSection.style.display = 'block';
            
            // Update solution text
            const solutionText = document.getElementById('solutionText');
            if (solutionText) {
                solutionText.textContent = solution;
            }
            
            // Update move count
            const moveCountElement = document.getElementById('moveCount');
            if (moveCountElement) {
                moveCountElement.textContent = moveCount;
            }
            
            // Scroll to solution
            solutionSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    copySolution() {
        const solutionText = document.getElementById('solutionText');
        if (solutionText) {
            navigator.clipboard.writeText(solutionText.textContent).then(() => {
                // Show feedback
                const copyBtn = document.getElementById('copySolutionBtn');
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy solution:', err);
                alert('Failed to copy solution to clipboard');
            });
        }
    }

    newSolve() {
        // Reset cube state
        this.cubeState = {
            blue: new Array(9).fill('blue'),
            green: new Array(9).fill('green'),
            red: new Array(9).fill('red'),
            orange: new Array(9).fill('orange'),
            yellow: new Array(9).fill('yellow'),
            white: new Array(9).fill('white')
        };
        
        // Reset UI
        this.currentFaceIndex = 0;
        this.updateFaceDisplay();
        this.updateProgressIndicator();
        this.update3DView();
        
        // Hide solution
        document.getElementById('solutionSection').style.display = 'none';
        
        // Switch back to visual input
        this.switchInputMethod('visual');
    }
}

// Initialize solver when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing CubeSolver...');
    try {
        window.cubeSolver = new CubeSolver();
        console.log('CubeSolver initialized successfully');
    } catch (error) {
        console.error('Error initializing CubeSolver:', error);
    }
});
