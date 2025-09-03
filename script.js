// Performance-optimized grid using typed arrays
class OptimizedGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height);
        this.obstacles = new Uint8Array(width * height);
        this.food = new Uint8Array(width * height);
    }
    
    get(x, y) {
        return this.data[y * this.width + x];
    }
    
    set(x, y, value) {
        this.data[y * this.width + x] = value;
    }
    
    getObstacle(x, y) {
        return this.obstacles[y * this.width + x];
    }
    
    setObstacle(x, y, value) {
        this.obstacles[y * this.width + x] = value;
    }
    
    getFood(x, y) {
        return this.food[y * this.width + x];
    }
    
    setFood(x, y, value) {
        this.food[y * this.width + x] = value;
    }
    
    clear() {
        this.data.fill(0);
        this.obstacles.fill(0);
        this.food.fill(0);
    }
}

// Default machine configurations
const machineConfigs = [
    {
        name: "Classic Ant",
        type: 'ant',
        defaultQuantity: 2,
        enabled: true,
        colorSequence: ['#000000', '#FFFFFF'],
        rules: 'RL'
    },
    {
        name: "Highway Builder",
        type: 'ant',
        defaultQuantity: 1,
        enabled: true,
        colorSequence: ['#000000', '#FF4444', '#44FF44', '#4444FF'],
        rules: 'RLLR'
    },
    {
        name: "Chaotic Weaver",
        type: 'turmite',
        defaultQuantity: 1,
        enabled: true,
        colorSequence: ['#1A1A1A', '#FF6B6B', '#4ECDC4', '#45B7D1'],
        rules: {
            0: [[1, 1, 0], [2, -1, 1], [3, 1, 1], [0, 2, 0]],
            1: [[3, -1, 0], [0, 1, 0], [1, -1, 1], [2, 2, 1]]
        }
    },
    {
        name: "Square Dancer",
        type: 'dragonfly',
        defaultQuantity: 2,
        enabled: true,
        colorSequence: ['#101010', '#87CEEB', '#FFD700'],
        dartLength: 12,
        wanderProbability: 0.1
    },
    {
        name: "Spiral Growth",
        type: 'turmite',
        defaultQuantity: 1,
        enabled: true,
        colorSequence: ['#2A2A2A', '#FFA500'],
        rules: {
            0: [[1, 1, 0], [1, -1, 1]],
            1: [[0, -1, 1], [0, 1, 0]]
        }
    }
];

// Main simulation class
class BugFarmSimulation {
    constructor() {
        this.canvas = document.getElementById('antCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.ctx.imageSmoothingEnabled = false;
        
        this.cellSize = 4;
        this.updateCanvasSize();
        
        this.grid = new OptimizedGrid(this.cols, this.rows);
        this.machines = [];
        this.colorMap = new Map();
        this.isRunning = true;
        this.stepsPerFrame = 50;
        this.totalSteps = 0;
        this.lastFrameTime = performance.now();
        this.fps = 60;
        
        this.obstacleColor = '#666666';
        this.foodColor = '#4ADE80';
        this.obstacleColorIndex = 254;
        this.foodColorIndex = 253;
        
        this.initColorMap();
        this.initEventListeners();
        this.initUI();
        this.reset();
        this.animate();
    }
    
    updateCanvasSize() {
        this.width = 800;
        this.height = 640;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.cols = Math.floor(this.width / this.cellSize);
        this.rows = Math.floor(this.height / this.cellSize);
    }
    
    initColorMap() {
        let colorIndex = 0;
        machineConfigs.forEach(config => {
            config.colorSequence.forEach(color => {
                if (!this.colorMap.has(color)) {
                    this.colorMap.set(color, colorIndex++);
                }
            });
        });
        this.colorMap.set(this.obstacleColor, this.obstacleColorIndex);
        this.colorMap.set(this.foodColor, this.foodColorIndex);
    }
    
    getColorIndex(color) {
        return this.colorMap.get(color) || 0;
    }
    
    getColorFromIndex(index) {
        for (let [color, idx] of this.colorMap) {
            if (idx === index) return color;
        }
        return '#000000';
    }
    
    reset() {
        this.grid.clear();
        this.machines = [];
        this.totalSteps = 0;
        
        const occupiedPositions = new Set();
        
        machineConfigs.forEach((config, configIndex) => {
            const quantityInput = document.getElementById(`quantity-${configIndex}`);
            const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 0 : config.defaultQuantity;
            
            for (let i = 0; i < quantity; i++) {
                let x, y, posKey;
                let attempts = 0;
                do {
                    x = Math.floor(Math.random() * this.cols);
                    y = Math.floor(Math.random() * this.rows);
                    posKey = `${x},${y}`;
                    attempts++;
                } while ((occupiedPositions.has(posKey) || this.grid.getObstacle(x, y) === 1) && attempts < 100);
                
                if (attempts < 100) {
                    occupiedPositions.add(posKey);
                    
                    const colorIndices = config.colorSequence.map(c => this.getColorIndex(c));
                    
                    this.machines.push({
                        ...config,
                        colorIndices,
                        x,
                        y,
                        dir: Math.floor(Math.random() * 4),
                        state: 0,
                        stepsTaken: 0,
                        sidesCompleted: 0,
                        squaresCompleted: 0,
                        active: config.enabled,
                        foodCollected: 0
                    });
                }
            }
        });
        
        this.render();
        this.updateStats();
    }
    
    updateMachine(machine) {
        if (!machine.active) return;
        
        // Wrap boundaries
        machine.x = (machine.x + this.cols) % this.cols;
        machine.y = (machine.y + this.rows) % this.rows;
        
        // Check for obstacles
        if (this.grid.getObstacle(machine.x, machine.y) === 1) {
            // Bounce off obstacle
            machine.dir = (machine.dir + 2) % 4;
            this.moveForward(machine);
            return;
        }
        
        // Check for food
        if (this.grid.getFood(machine.x, machine.y) === 1) {
            machine.foodCollected++;
            this.grid.setFood(machine.x, machine.y, 0);
            // Food gives energy boost - random direction change
            if (machine.type === 'ant') {
                machine.dir = (machine.dir + Math.floor(Math.random() * 4)) % 4;
            }
        }
        
        const currentColorIndex = this.grid.get(machine.x, machine.y);
        let colorIndexInSequence = machine.colorIndices.indexOf(currentColorIndex);
        if (colorIndexInSequence === -1) colorIndexInSequence = 0;
        
        if (machine.type === 'ant') {
            const turn = machine.rules[colorIndexInSequence % machine.rules.length];
            machine.dir = (machine.dir + (turn === 'R' ? 1 : 3)) % 4;
            const newColorIndex = machine.colorIndices[(colorIndexInSequence + 1) % machine.colorIndices.length];
            this.grid.set(machine.x, machine.y, newColorIndex);
            
        } else if (machine.type === 'turmite') {
            const stateRules = machine.rules[machine.state];
            if (!stateRules || !stateRules[colorIndexInSequence]) {
                colorIndexInSequence = 0;
            }
            const rule = stateRules[colorIndexInSequence] || [0, 0, 0];
            const [newColorIdx, turn, newState] = rule;
            this.grid.set(machine.x, machine.y, machine.colorIndices[newColorIdx]);
            machine.state = newState;
            
            if (turn === 1) machine.dir = (machine.dir + 1) % 4;
            else if (turn === -1) machine.dir = (machine.dir + 3) % 4;
            else if (turn === 2) machine.dir = (machine.dir + 2) % 4;
            
        } else if (machine.type === 'dragonfly') {
            // Enhanced dragonfly logic
            this.grid.set(machine.x, machine.y, machine.colorIndices[1]);
            machine.stepsTaken++;
            
            if (machine.stepsTaken >= machine.dartLength) {
                // Mark corner
                this.grid.set(machine.x, machine.y, machine.colorIndices[2]);
                machine.stepsTaken = 0;
                machine.sidesCompleted++;
                
                if (machine.sidesCompleted >= 4) {
                    // Completed a square
                    machine.sidesCompleted = 0;
                    machine.squaresCompleted++;
                    
                    // Decide next behavior
                    if (Math.random() < (machine.wanderProbability || 0.1)) {
                        // Random walk
                        machine.dir = Math.floor(Math.random() * 4);
                        // Vary square size
                        machine.dartLength = 8 + Math.floor(Math.random() * 16);
                    } else {
                        // New square at different orientation
                        machine.dir = (machine.dir + 1 + Math.floor(Math.random() * 3)) % 4;
                    }
                } else {
                    // Continue square - turn 90 degrees right
                    machine.dir = (machine.dir + 1) % 4;
                }
            }
        }
        
        this.moveForward(machine);
    }
    
    moveForward(machine) {
        const moves = [
            [0, -1], // North
            [1, 0],  // East
            [0, 1],  // South
            [-1, 0]  // West
        ];
        const [dx, dy] = moves[machine.dir];
        machine.x = (machine.x + dx + this.cols) % this.cols;
        machine.y = (machine.y + dy + this.rows) % this.rows;
    }
    
    update() {
        if (!this.isRunning) return;
        
        for (let step = 0; step < this.stepsPerFrame; step++) {
            this.machines.forEach(machine => this.updateMachine(machine));
            this.totalSteps++;
        }
        
        this.render();
        this.updateStats();
    }
    
    render() {
        // Create image data for efficient rendering
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const colorIndex = this.grid.get(x, y);
                const obstacleValue = this.grid.getObstacle(x, y);
                const foodValue = this.grid.getFood(x, y);
                
                let color = '#000000';
                if (obstacleValue === 1) {
                    color = this.obstacleColor;
                } else if (foodValue === 1) {
                    color = this.foodColor;
                } else {
                    color = this.getColorFromIndex(colorIndex);
                }
                
                const rgb = this.hexToRgb(color);
                
                for (let py = 0; py < this.cellSize; py++) {
                    for (let px = 0; px < this.cellSize; px++) {
                        const idx = ((y * this.cellSize + py) * this.width + (x * this.cellSize + px)) * 4;
                        data[idx] = rgb.r;
                        data[idx + 1] = rgb.g;
                        data[idx + 2] = rgb.b;
                        data[idx + 3] = 255;
                    }
                }
            }
        }
        
        // Draw machines on top
        this.machines.forEach(machine => {
            if (machine.active) {
                const color = machine.type === 'dragonfly' ? 
                    machine.colorSequence[2] : machine.colorSequence[1];
                const rgb = this.hexToRgb(color);
                
                for (let py = 0; py < this.cellSize; py++) {
                    for (let px = 0; px < this.cellSize; px++) {
                        const idx = ((machine.y * this.cellSize + py) * this.width + 
                                   (machine.x * this.cellSize + px)) * 4;
                        data[idx] = rgb.r;
                        data[idx + 1] = rgb.g;
                        data[idx + 2] = rgb.b;
                        data[idx + 3] = 255;
                    }
                }
            }
        });
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    addRocks(density = 0.1) {
        const numRocks = Math.floor(this.cols * this.rows * density);
        for (let i = 0; i < numRocks; i++) {
            const x = Math.floor(Math.random() * this.cols);
            const y = Math.floor(Math.random() * this.rows);
            
            // Create rock clusters
            const clusterSize = Math.random() < 0.3 ? 2 : 1;
            for (let dx = 0; dx < clusterSize; dx++) {
                for (let dy = 0; dy < clusterSize; dy++) {
                    const nx = (x + dx) % this.cols;
                    const ny = (y + dy) % this.rows;
                    this.grid.setObstacle(nx, ny, 1);
                }
            }
        }
    }
    
    addMaze() {
        // Generate maze pattern
        for (let y = 0; y < this.rows; y += 10) {
            for (let x = 0; x < this.cols; x++) {
                if (x % 20 > 5 && x % 20 < 15) {
                    this.grid.setObstacle(x, y, 1);
                }
            }
        }
        
        for (let x = 0; x < this.cols; x += 10) {
            for (let y = 0; y < this.rows; y++) {
                if (y % 20 > 5 && y % 20 < 15) {
                    this.grid.setObstacle(x, y, 1);
                }
            }
        }
    }
    
    addFood(density = 0.05) {
        const numFood = Math.floor(this.cols * this.rows * density);
        for (let i = 0; i < numFood; i++) {
            const x = Math.floor(Math.random() * this.cols);
            const y = Math.floor(Math.random() * this.rows);
            if (this.grid.getObstacle(x, y) === 0) {
                this.grid.setFood(x, y, 1);
            }
        }
    }
    
    clearEnvironment() {
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                this.grid.setObstacle(x, y, 0);
                this.grid.setFood(x, y, 0);
            }
        }
    }
    
    updateStats() {
        document.getElementById('stepCount').textContent = this.totalSteps.toLocaleString();
        document.getElementById('activeCount').textContent = 
            this.machines.filter(m => m.active).length;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        if (deltaTime > 0) {
            this.fps = Math.round(1000 / deltaTime);
            document.getElementById('fpsCount').textContent = this.fps;
        }
        this.lastFrameTime = currentTime;
    }
    
    initEventListeners() {
        // Simulation controls
        document.getElementById('startPauseBtn').addEventListener('click', () => {
            this.isRunning = !this.isRunning;
            document.getElementById('startPauseBtn').textContent = 
                this.isRunning ? 'Pause' : 'Start';
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('speedRange').addEventListener('input', (e) => {
            this.stepsPerFrame = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.stepsPerFrame;
        });
        
        document.getElementById('gridSizeRange').addEventListener('input', (e) => {
            this.cellSize = parseInt(e.target.value);
            document.getElementById('gridSizeValue').textContent = `${this.cellSize}px`;
            this.updateCanvasSize();
            this.grid = new OptimizedGrid(this.cols, this.rows);
            this.reset();
        });
        
        // Environment controls
        document.getElementById('densityRange').addEventListener('input', (e) => {
            const density = parseInt(e.target.value);
            document.getElementById('densityValue').textContent = `${density}%`;
        });
        
        document.getElementById('addRocks').addEventListener('click', () => {
            const density = parseInt(document.getElementById('densityRange').value) / 100;
            this.addRocks(density);
            this.render();
        });
        
        document.getElementById('addMaze').addEventListener('click', () => {
            this.addMaze();
            this.render();
        });
        
        document.getElementById('addFood').addEventListener('click', () => {
            const density = parseInt(document.getElementById('densityRange').value) / 200;
            this.addFood(density);
            this.render();
        });
        
        document.getElementById('clearEnv').addEventListener('click', () => {
            this.clearEnvironment();
            this.render();
        });
        
        // Modal controls
        document.getElementById('addMachineBtn').addEventListener('click', () => {
            document.getElementById('machineModal').classList.add('active');
        });
        
        document.getElementById('modalClose').addEventListener('click', () => {
            document.getElementById('machineModal').classList.remove('active');
        });
        
        document.getElementById('modalCancel').addEventListener('click', () => {
            document.getElementById('machineModal').classList.remove('active');
        });
        
        document.getElementById('modalType').addEventListener('change', (e) => {
            const helpText = document.getElementById('rulesHelp');
            if (e.target.value === 'ant') {
                helpText.textContent = 'For Ant: "RL" or "RLL"';
            } else if (e.target.value === 'turmite') {
                helpText.textContent = 'For Turmite: {"0": [[1, 1, 0], [2, -1, 1]]}';
            } else if (e.target.value === 'dragonfly') {
                helpText.textContent = 'For Dragonfly: dartLength (number)';
            }
        });
        
        document.getElementById('modalSave').addEventListener('click', () => {
            const name = document.getElementById('modalName').value || 'Custom Machine';
            const type = document.getElementById('modalType').value;
            const colorsText = document.getElementById('modalColors').value || '#000000, #FFFFFF';
            const rulesText = document.getElementById('modalRules').value;
            
            let rules;
            let dartLength;
            let wanderProbability;
            
            try {
                if (type === 'ant') {
                    rules = rulesText.toUpperCase().replace(/[^RL]/g, '') || 'RL';
                } else if (type === 'turmite') {
                    rules = JSON.parse(rulesText);
                } else if (type === 'dragonfly') {
                    dartLength = parseInt(rulesText) || 10;
                    wanderProbability = 0.15;
                }
                
                const colorSequence = colorsText.split(',').map(c => c.trim());
                
                const newConfig = {
                    name,
                    type,
                    defaultQuantity: 1,
                    enabled: true,
                    colorSequence,
                    rules,
                    dartLength,
                    wanderProbability
                };
                
                machineConfigs.push(newConfig);
                this.initColorMap();
                this.initUI();
                document.getElementById('machineModal').classList.remove('active');
                
            } catch (e) {
                alert('Invalid input format. Please check your values and try again.');
            }
        });
    }
    
    initUI() {
        const machineList = document.getElementById('machineList');
        machineList.innerHTML = '';
        
        machineConfigs.forEach((config, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'machine-item';
            
            // Header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'machine-header';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'machine-name';
            nameDiv.textContent = config.name;
            
            const toggle = document.createElement('div');
            toggle.className = `toggle-switch ${config.enabled ? 'active' : ''}`;
            toggle.id = `toggle-${index}`;
            toggle.addEventListener('click', () => {
                config.enabled = !config.enabled;
                toggle.classList.toggle('active');
                this.machines.forEach(m => {
                    if (m.name === config.name) {
                        m.active = config.enabled;
                    }
                });
                this.render();
            });
            
            headerDiv.appendChild(nameDiv);
            headerDiv.appendChild(toggle);
            
            // Controls
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'machine-controls';
            
            const quantityDiv = document.createElement('div');
            quantityDiv.className = 'machine-control';
            quantityDiv.innerHTML = `
                <label>Quantity</label>
                <input type="number" id="quantity-${index}" min="0" max="50" value="${config.defaultQuantity}">
            `;
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'machine-control';
            if (config.type === 'dragonfly') {
                infoDiv.innerHTML = `
                    <label>Square Size</label>
                    <input type="number" id="dartLength-${index}" min="4" max="30" value="${config.dartLength || 10}">
                `;
            } else if (config.type === 'ant') {
                infoDiv.innerHTML = `
                    <label>Rules</label>
                    <input type="text" value="${config.rules}" readonly>
                `;
            } else {
                infoDiv.innerHTML = `
                    <label>States</label>
                    <input type="text" value="${Object.keys(config.rules || {}).length}" readonly>
                `;
            }
            
            controlsDiv.appendChild(quantityDiv);
            controlsDiv.appendChild(infoDiv);
            
            // Color display
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-display';
            config.colorSequence.forEach(color => {
                const chip = document.createElement('div');
                chip.className = 'color-chip';
                chip.style.backgroundColor = color;
                colorDiv.appendChild(chip);
            });
            
            itemDiv.appendChild(headerDiv);
            itemDiv.appendChild(controlsDiv);
            itemDiv.appendChild(colorDiv);
            
            machineList.appendChild(itemDiv);
        });
    }
    
    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const simulation = new BugFarmSimulation();
});