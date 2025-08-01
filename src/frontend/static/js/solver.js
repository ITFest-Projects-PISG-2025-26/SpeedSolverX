// Cube Solver Interactive Interface
class CubeSolver {
    constructor() {
        this.currentFaceIndex = 0;
        this.selectedColor = 'blue';
        this.cubeState = {
            blue: Array(9).fill('blue'),    // Front face (F)
            red: Array(9).fill('red'),      // Right face (R)
            green: Array(9).fill('green'),  // Back face (B)
            orange: Array(9).fill('orange'), // Left face (L)
            white: Array(9).fill('white'),   // Top face (U)
            yellow: Array(9).fill('yellow') // Bottom face (D)
        };
        
        this.faceOrder = ['blue', 'red', 'green', 'orange', 'white', 'yellow'];
        this.faceNames = {
            blue: 'Blue Face (Front)',
            red: 'Red Face (Right)',
            green: 'Green Face (Back)',
            orange: 'Orange Face (Left)',
            white: 'White Face (Top)',
            yellow: 'Yellow Face (Bottom)'
        };
        
        this.colorMap = {
            white: '#ffffff',
            yellow: '#ffff00',
            blue: '#0066cc',
            green: '#00cc00',
            red: '#cc0000',
            orange: '#ff6600'
        };

        this.camera = null;
        this.cameraStream = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateCubeFace();
        this.updateFaceDisplay();
        this.updateProgressIndicator();
    }

    setupEventListeners() {
        // Input method switching
        document.getElementById('visualInputBtn').addEventListener('click', () => this.switchInputMethod('visual'));
        document.getElementById('cameraInputBtn').addEventListener('click', () => this.switchInputMethod('camera'));

        // Color palette
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
        });

        // Face navigation
        document.getElementById('prevFaceBtn').addEventListener('click', () => this.previousFace());
        document.getElementById('nextFaceBtn').addEventListener('click', () => this.nextFace());

        // Control buttons
        document.getElementById('resetFaceBtn').addEventListener('click', () => this.resetCurrentFace());
        document.getElementById('solveCubeBtn').addEventListener('click', () => this.solveCube());

        // Camera controls
        document.getElementById('startCameraBtn').addEventListener('click', () => this.startCamera());
        document.getElementById('captureBtn').addEventListener('click', () => this.captureFrame());
        document.getElementById('stopCameraBtn').addEventListener('click', () => this.stopCamera());

        // Solution controls
        const copySolutionBtn = document.getElementById('copySolutionBtn');
        const newSolveBtn = document.getElementById('newSolveBtn');
        
        if (copySolutionBtn) {
            copySolutionBtn.addEventListener('click', () => this.copySolution());
        }
        if (newSolveBtn) {
            newSolveBtn.addEventListener('click', () => this.resetSolver());
        }

        // Progress step navigation
        document.querySelectorAll('.step').forEach((step, index) => {
            step.addEventListener('click', () => this.goToFace(index));
        });
    }

    switchInputMethod(method) {
        // Update button states
        document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${method}InputBtn`).classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.input-section').forEach(section => section.classList.remove('active'));
        document.getElementById(`${method}InputSection`).classList.add('active');

        // Stop camera if switching away from camera
        if (method !== 'camera' && this.cameraStream) {
            this.stopCamera();
        }
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
        cubeFace.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const square = document.createElement('div');
            square.className = 'cube-square';
            square.dataset.position = i;
            
            // Center square (position 4) is fixed to face color
            if (i === 4) {
                square.classList.add('center-square');
                square.style.backgroundColor = this.colorMap[this.faceOrder[this.currentFaceIndex]];
            } else {
                square.style.backgroundColor = this.colorMap[this.cubeState[this.faceOrder[this.currentFaceIndex]][i]];
                square.addEventListener('click', (e) => this.setSquareColor(e.target, i));
            }

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
    }

    updateFaceDisplay() {
        const currentFace = this.faceOrder[this.currentFaceIndex];
        
        // Update face name
        document.getElementById('currentFaceName').textContent = this.faceNames[currentFace];
        
        // Update face counter
        document.getElementById('faceCounter').textContent = `${this.currentFaceIndex + 1} / 6`;
        
        // Update navigation buttons
        document.getElementById('prevFaceBtn').disabled = this.currentFaceIndex === 0;
        document.getElementById('nextFaceBtn').disabled = this.currentFaceIndex === 5;
        
        // Update instructions
        const instructions = document.getElementById('faceInstructions');
        if (this.currentFaceIndex === 5) {
            instructions.textContent = 'Complete! Ready to solve the cube.';
            document.getElementById('solveCubeBtn').style.display = 'block';
        } else {
            instructions.textContent = `Click on the squares to set their colors. The center is fixed to ${currentFace}.`;
            document.getElementById('solveCubeBtn').style.display = 'none';
        }
        
        // Regenerate face
        this.generateCubeFace();
    }

    updateProgressIndicator() {
        // Update progress steps
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index <= this.currentFaceIndex);
        });
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressPercent = ((this.currentFaceIndex + 1) / 6) * 100;
        progressFill.style.width = `${progressPercent}%`;
    }

    previousFace() {
        if (this.currentFaceIndex > 0) {
            this.currentFaceIndex--;
            this.updateFaceDisplay();
            this.updateProgressIndicator();
        }
    }

    nextFace() {
        if (this.currentFaceIndex < 5) {
            this.currentFaceIndex++;
            this.updateFaceDisplay();
            this.updateProgressIndicator();
        }
    }

    goToFace(faceIndex) {
        if (faceIndex >= 0 && faceIndex < 6) {
            this.currentFaceIndex = faceIndex;
            this.updateFaceDisplay();
            this.updateProgressIndicator();
        }
    }

    resetCurrentFace() {
        const currentFace = this.faceOrder[this.currentFaceIndex];
        
        // Reset all squares except center (position 4)
        for (let i = 0; i < 9; i++) {
            if (i !== 4) {
                this.cubeState[currentFace][i] = currentFace;
            }
        }
        
        this.generateCubeFace();
        
        // Visual feedback
        const resetBtn = document.getElementById('resetFaceBtn');
        resetBtn.classList.add('btn-success');
        resetBtn.innerHTML = '<i class="fas fa-check"></i> Reset Complete';
        setTimeout(() => {
            resetBtn.classList.remove('btn-success');
            resetBtn.innerHTML = '<i class="fas fa-undo"></i> Reset Face';
        }, 1000);
    }

    async solveCube() {
        const cubeString = this.convertCubeStateToString();
        
        // Validate cube state before sending
        if (cubeString.length !== 54) {
            alert('Invalid cube state. Please ensure all faces are properly configured.');
            return;
        }
        
        // Show loading state
        const solveBtn = document.getElementById('solveCubeBtn');
        const originalText = solveBtn.innerHTML;
        solveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Solving...';
        solveBtn.disabled = true;
        
        try {
            const response = await fetch('/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `cube=${encodeURIComponent(cubeString)}`
            });
            
            if (response.ok) {
                const result = await response.text();
                this.displaySolution(result);
            } else {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error solving cube:', error);
            alert(`Error solving cube: ${error.message}\n\nPlease check your cube configuration and try again.`);
        } finally {
            // Reset button state
            solveBtn.innerHTML = originalText;
            solveBtn.disabled = false;
        }
    }

    convertCubeStateToString() {
        // Convert cube state to string format expected by solver
        // Order: Up, Right, Front, Down, Left, Back (URFDLB)
        const faceMapping = {
            white: 'W',   // Up
            red: 'R',     // Right
            blue: 'F',    // Front
            yellow: 'D',  // Down
            orange: 'L',  // Left
            green: 'B'    // Back
        };
        
        let cubeString = '';
        
        // Add faces in URFDLB order
        const solverOrder = ['white', 'red', 'blue', 'yellow', 'orange', 'green'];
        
        solverOrder.forEach(face => {
            this.cubeState[face].forEach(color => {
                cubeString += faceMapping[color];
            });
        });
        
        console.log('Generated cube string:', cubeString);
        console.log('Cube state:', this.cubeState);
        
        return cubeString;
    }

    displaySolution(solutionHtml) {
        // Parse solution from HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(solutionHtml, 'text/html');
        const solutionElement = doc.querySelector('.solution-display');
        
        if (solutionElement) {
            document.getElementById('solutionDisplay').innerHTML = solutionElement.innerHTML;
            document.getElementById('solutionSection').style.display = 'block';
            
            // Scroll to solution
            document.getElementById('solutionSection').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    }

    copySolution() {
        const solutionText = document.getElementById('solutionDisplay').textContent;
        navigator.clipboard.writeText(solutionText).then(() => {
            const copyBtn = document.getElementById('copySolutionBtn');
            copyBtn.classList.add('btn-success');
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.classList.remove('btn-success');
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Solution';
            }, 2000);
        });
    }

    resetSolver() {
        // Reset cube state
        this.cubeState = {
            blue: Array(9).fill('blue'),
            red: Array(9).fill('red'),
            green: Array(9).fill('green'),
            orange: Array(9).fill('orange'),
            white: Array(9).fill('white'),
            yellow: Array(9).fill('yellow')
        };
        
        this.currentFaceIndex = 0;
        this.updateFaceDisplay();
        this.updateProgressIndicator();
        
        // Hide solution
        document.getElementById('solutionSection').style.display = 'none';
        
        // Switch back to visual input
        this.switchInputMethod('visual');
    }

    // Camera functionality
    async startCamera() {
        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'environment' // Use back camera if available
                }
            });
            
            const video = document.getElementById('cameraVideo');
            video.srcObject = this.cameraStream;
            
            // Update UI
            document.getElementById('startCameraBtn').style.display = 'none';
            document.getElementById('captureBtn').style.display = 'inline-block';
            document.getElementById('stopCameraBtn').style.display = 'inline-block';
            
            this.updateCameraInstructions();
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions and try again.');
        }
    }

    captureFrame() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0);
        
        // Get image data for processing
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Store captured face
        this.storeCapturedFace(imageData);
        
        // Move to next face or complete
        if (this.currentFaceIndex < 5) {
            this.nextFace();
            this.updateCameraInstructions();
        } else {
            // All faces captured
            document.getElementById('cameraInstructions').textContent = 'All faces captured! Processing...';
            this.processCapturedFaces();
        }
    }

    storeCapturedFace(imageData) {
        const capturedFaces = document.getElementById('capturedFaces');
        const facePreview = document.createElement('div');
        facePreview.className = 'face-preview';
        facePreview.innerHTML = `
            <img src="${imageData}" alt="${this.faceNames[this.faceOrder[this.currentFaceIndex]]}">
            <span>${this.faceNames[this.faceOrder[this.currentFaceIndex]]}</span>
        `;
        capturedFaces.appendChild(facePreview);
    }

    updateCameraInstructions() {
        const currentFace = this.faceOrder[this.currentFaceIndex];
        document.getElementById('cameraInstructions').textContent = 
            `Show the ${this.faceNames[currentFace]} to the camera`;
    }

    processCapturedFaces() {
        // In a real implementation, this would use computer vision
        // to detect cube colors from the captured images
        alert('Camera cube detection is a demo feature. Please use visual input method for accurate results.');
        this.switchInputMethod('visual');
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // Reset UI
        document.getElementById('startCameraBtn').style.display = 'inline-block';
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('stopCameraBtn').style.display = 'none';
        
        // Clear captured faces
        document.getElementById('capturedFaces').innerHTML = '';
    }
}

// Initialize solver when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cubeSolver = new CubeSolver();
});

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
.square-updated {
    animation: squareUpdate 0.3s ease;
}

@keyframes squareUpdate {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); box-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
    100% { transform: scale(1); }
}

.face-preview {
    display: inline-block;
    margin: 10px;
    text-align: center;
}

.face-preview img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.face-preview span {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
}
`;
document.head.appendChild(style);
