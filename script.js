// --- DOM Elements ---
const canvas = document.getElementById('antCanvas');
const ctx = canvas.getContext('2d');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedRange = document.getElementById('speedRange');
const antTogglesContainer = document.getElementById('antToggles');

// --- Simulation Configuration ---
const width = 1000;
const height = 800;
const cellSize = 4;
const cols = Math.floor(width / cellSize);
const rows = Math.floor(height / cellSize);

canvas.width = width;
canvas.height = height;

// --- Simulation State ---
let grid;
let machines;
let isRunning = true;
let stepsPerFrame = 50;

const machineConfigs = [
    {
        name: "Classic Ant",
        type: 'ant',
        defaultQuantity: 1,
        enabled: true,
        colorSequence: ['#000000', '#E0E0E0'],
        rules: 'RL'
    },
    {
        name: "3-Color Ant",
        type: 'ant',
        defaultQuantity: 1,
        enabled: true,
        colorSequence: ['#000000', '#FF5733', '#33FF57'],
        rules: 'RLL'
    },
    {
        name: "Chaotic Weaver Turmite",
        type: 'turmite',
        defaultQuantity: 2,
        enabled: true,
        colorSequence: ['#1A1A1A', '#FF5733', '#33FF57', '#33A7FF'],
        rules: {
            0: [[1, 1, 0], [2, -1, 1], [3, 1, 1], [0, 2, 0]],
            1: [[3, -1, 0], [0, 1, 0], [1, -1, 1], [2, 2, 1]]
        }
    },
    {
        name: "Dragonfly",
        type: 'dragonfly',
        defaultQuantity: 2,
        enabled: true,
        colorSequence: ['#101010', '#87CEEB', '#FFD700'],
        dartLength: 8,
    },
    {
        name: "Spiral Growth Turmite",
        type: 'turmite',
        defaultQuantity: 1,
        enabled: true,
        colorSequence: ['#202020', '#FFC300'],
        rules: {
            0: [ [1, 1, 0], [1, -1, 1] ],
            1: [ [0, -1, 1], [0, 1, 0] ]
        }
    }
];

// --- Core Functions ---

function createGrid(cols, rows, initialColor) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows).fill(initialColor);
    }
    return arr;
}

function resetSimulation() {
    const initialColor = machineConfigs[0].colorSequence[0];
    grid = createGrid(cols, rows, initialColor);
    machines = [];
    
    const occupiedPositions = new Set();

    machineConfigs.forEach((config, configIndex) => {
        const quantityInput = document.getElementById(`quantity-${configIndex}`);
        const enabledCheckbox = document.getElementById(`enabled-${configIndex}`);
        const quantity = parseInt(quantityInput.value, 10) || 0;
        const isEnabled = enabledCheckbox.checked;

        config.enabled = isEnabled; // Update config state

        for (let i = 0; i < quantity; i++) {
            let x, y, posKey;
            do {
                x = Math.floor(Math.random() * cols);
                y = Math.floor(Math.random() * rows);
                posKey = `${x},${y}`;
            } while (occupiedPositions.has(posKey));
            occupiedPositions.add(posKey);

            machines.push({
                ...config,
                x: x,
                y: y,
                dir: Math.floor(Math.random() * 4),
                state: 0,
                stepsTaken: 0,
                sidesCompleted: 0, // For Dragonfly square-making logic
                active: isEnabled
            });
        }
    });

    drawFullGrid();
    drawMachines();
}

function initializeUI() {
    antTogglesContainer.innerHTML = '';
    machineConfigs.forEach((config, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'ant-toggle-item';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'ant-header';
        
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `enabled-${index}`;
        checkbox.checked = config.enabled;
        checkbox.addEventListener('change', () => {
            config.enabled = checkbox.checked;
            machines.forEach(m => {
                if (m.name === config.name) {
                    m.active = config.enabled;
                }
            });
            // Redraw to show/hide toggled machines instantly
            drawFullGrid();
            drawMachines();
        });
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(config.name));
        
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.id = `quantity-${index}`;
        quantityInput.min = 0;
        quantityInput.value = config.defaultQuantity;
        
        headerDiv.appendChild(label);
        headerDiv.appendChild(quantityInput);

        const rulesDiv = document.createElement('div');
        rulesDiv.className = 'ant-rules';
        let ruleHtml = `Colors: `;
        config.colorSequence.forEach(color => {
            ruleHtml += `<span class="color-box" style="background-color: ${color};"></span>`;
        });
        rulesDiv.innerHTML = ruleHtml;

        itemDiv.appendChild(headerDiv);
        itemDiv.appendChild(rulesDiv);
        antTogglesContainer.appendChild(itemDiv);
    });
}

function update() {
    if (!isRunning) return;

    for (let step = 0; step < stepsPerFrame; step++) {
        machines.forEach(m => {
            if (!m.active) return;

            if (m.x < 0) m.x = cols - 1;
            if (m.x >= cols) m.x = 0;
            if (m.y < 0) m.y = rows - 1;
            if (m.y >= rows) m.y = 0;

            let colorIndex = m.colorSequence.indexOf(grid[m.x][m.y]);
            if (colorIndex === -1) colorIndex = 0;

            if (m.type === 'ant') {
                const turn = m.rules[colorIndex];
                m.dir = (m.dir + (turn === 'R' ? 1 : 3)) % 4;
                grid[m.x][m.y] = m.colorSequence[(colorIndex + 1) % m.colorSequence.length];
            } else if (m.type === 'turmite') {
                const rule = m.rules[m.state][colorIndex];
                const [newColorIndex, turn, newState] = rule;
                grid[m.x][m.y] = m.colorSequence[newColorIndex];
                m.state = newState;
                if (turn === 1) m.dir = (m.dir + 1) % 4;
                else if (turn === -1) m.dir = (m.dir + 3) % 4;
                else if (turn === 2) m.dir = (m.dir + 2) % 4;
            } else if (m.type === 'dragonfly') {
                // Dragonfly logic: Completes a full square, then reorients randomly.
                
                // Leave the trail color while darting
                grid[m.x][m.y] = m.colorSequence[1];
                m.stepsTaken++;

                // Check if the current side of the square is complete
                if (m.stepsTaken >= m.dartLength) {
                    // Mark the corner with the turn point color
                    grid[m.x][m.y] = m.colorSequence[2];
                    
                    m.stepsTaken = 0; // Reset for the next side
                    m.sidesCompleted++;

                    // Check if a full square (4 sides) is complete
                    if (m.sidesCompleted >= 4) {
                        m.sidesCompleted = 0; // Reset for the next square
                        // Choose a new, completely random direction
                        m.dir = Math.floor(Math.random() * 4);
                    } else {
                        // Just turn right to continue the current square -- The dragonfly keeps getting stuck here, it will complete 4 squares and then get stuck in a loop.
                        m.dir = (m.dir + 1) % 4;
                    }
                }
            }
            
            drawCell(m.x, m.y);

            if (m.dir === 0) m.y--;
            else if (m.dir === 1) m.x++;
            else if (m.dir === 2) m.y++;
            else if (m.dir === 3) m.x--;
        });
    }
    
    drawMachines();
    requestAnimationFrame(update);
}

// --- Drawing Functions ---

function drawCell(x, y) {
    ctx.fillStyle = grid[x][y];
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawFullGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            drawCell(i, j);
        }
    }
}

function drawMachines() {
    machines.forEach(m => {
        if (m.active) {
            // Dragonfly is drawn with its turn color (gold) to make it visible.
            const machineColor = m.type === 'dragonfly' ? m.colorSequence[2] : m.colorSequence[1];
            ctx.fillStyle = machineColor || '#FFFFFF';
            ctx.fillRect(m.x * cellSize, m.y * cellSize, cellSize, cellSize);
        }
    });
}

// --- Event Listeners ---

startPauseBtn.addEventListener('click', () => {
    isRunning = !isRunning;
    startPauseBtn.textContent = isRunning ? 'Pause' : 'Start';
    if (isRunning) requestAnimationFrame(update);
});

resetBtn.addEventListener('click', () => {
    resetSimulation();
    if (!isRunning) {
        isRunning = true;
        startPauseBtn.textContent = 'Pause';
        requestAnimationFrame(update);
    }
});

speedRange.addEventListener('input', (e) => {
    stepsPerFrame = parseInt(e.target.value, 10);
});

// --- Initialisation ---
initializeUI();
resetSimulation();
requestAnimationFrame(update);
