// 3D Cube Viewer using Three.js
class Cube3DViewer {
    constructor(container) {
        console.log('Cube3DViewer constructor called with container:', container);
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.cube = null;
        this.faces = [];
        
        this.colors = {
            yellow: 0xFFFF00,   // Top
            white: 0xFFFFFF,    // Bottom
            red: 0xFF0000,      // Right
            orange: 0xFF6600,   // Left
            blue: 0x0066CC,     // Front
            green: 0x00CC00     // Back
        };
        
        console.log('About to initialize 3D viewer...');
        this.init();
        console.log('3D viewer initialization complete');
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(400, 400);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Setup camera
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Setup lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Create cube
        this.createCube();
        
        // Setup controls
        this.setupControls();
        
        // Start render loop
        this.animate();
    }
    
    createCube() {
        // Create cube group
        this.cube = new THREE.Group();
        this.faces = [];
        
        // Define face positions and rotations
        const faceConfigs = [
            { name: 'front', pos: [0, 0, 1.51], rot: [0, 0, 0], color: 'blue' },
            { name: 'back', pos: [0, 0, -1.51], rot: [0, Math.PI, 0], color: 'green' },
            { name: 'right', pos: [1.51, 0, 0], rot: [0, Math.PI/2, 0], color: 'red' },
            { name: 'left', pos: [-1.51, 0, 0], rot: [0, -Math.PI/2, 0], color: 'orange' },
            { name: 'top', pos: [0, 1.51, 0], rot: [-Math.PI/2, 0, 0], color: 'yellow' },
            { name: 'bottom', pos: [0, -1.51, 0], rot: [Math.PI/2, 0, 0], color: 'white' }
        ];
        
        faceConfigs.forEach(config => {
            const face = this.createFace(config.color);
            face.position.set(...config.pos);
            face.rotation.set(...config.rot);
            face.userData = { name: config.name, color: config.color };
            this.faces.push(face);
            this.cube.add(face);
        });
        
        this.scene.add(this.cube);
    }
    
    createFace(defaultColor) {
        const faceGroup = new THREE.Group();
        const squares = [];
        
        // Create 3x3 grid of squares
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const geometry = new THREE.PlaneGeometry(0.9, 0.9);
                const material = new THREE.MeshLambertMaterial({ 
                    color: this.colors[defaultColor] 
                });
                
                const square = new THREE.Mesh(geometry, material);
                square.position.set(
                    (col - 1) * 1,
                    (1 - row) * 1,
                    0
                );
                
                // Add black border
                const borderGeometry = new THREE.PlaneGeometry(0.95, 0.95);
                const borderMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.8
                });
                const border = new THREE.Mesh(borderGeometry, borderMaterial);
                border.position.z = -0.001;
                square.add(border);
                
                square.userData = { row, col, color: defaultColor };
                squares.push(square);
                faceGroup.add(square);
            }
        }
        
        faceGroup.userData = { squares };
        return faceGroup;
    }
    
    setupControls() {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        
        const onMouseDown = (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        };
        
        const onMouseUp = () => {
            isMouseDown = false;
        };
        
        const onMouseMove = (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            this.cube.rotation.y += deltaX * 0.01;
            this.cube.rotation.x += deltaY * 0.01;
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        };
        
        const onWheel = (event) => {
            const scale = this.camera.position.length();
            const factor = event.deltaY > 0 ? 1.1 : 0.9;
            
            this.camera.position.multiplyScalar(factor);
            this.camera.lookAt(0, 0, 0);
        };
        
        this.renderer.domElement.addEventListener('mousedown', onMouseDown);
        this.renderer.domElement.addEventListener('mouseup', onMouseUp);
        this.renderer.domElement.addEventListener('mousemove', onMouseMove);
        this.renderer.domElement.addEventListener('wheel', onWheel);
    }
    
    updateCubeState(cubeState) {
        // Update each face based on cube state
        const faceMapping = {
            blue: 'front',
            green: 'back', 
            red: 'right',
            orange: 'left',
            yellow: 'top',
            white: 'bottom'
        };
        
        Object.keys(cubeState).forEach(faceColor => {
            const faceName = faceMapping[faceColor];
            const face = this.faces.find(f => f.userData.name === faceName);
            
            if (face && face.userData.squares) {
                const squares = face.userData.squares;
                cubeState[faceColor].forEach((squareColor, index) => {
                    if (squares[index]) {
                        squares[index].material.color.setHex(this.colors[squareColor]);
                        squares[index].userData.color = squareColor;
                    }
                });
            }
        });
    }
    
    resetView() {
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.cube.rotation.set(0, 0, 0);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        const size = Math.min(rect.width, 400);
        
        this.renderer.setSize(size, size);
        this.camera.aspect = 1;
        this.camera.updateProjectionMatrix();
    }
}
