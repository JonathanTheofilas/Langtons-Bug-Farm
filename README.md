# Langton's Bug Farm: Advanced Cellular Automata Playground

**Langton's Bug Farm** is an interactive, visual simulation of various cellular automata, including Langton's Ant, Turmites, and other Turing machines. Explore and experiment with multiple automaton types in a shared environment, each featuring customisable rules, behaviors, and controls.

---

## 🚀 Features

### 🌐 **Multiple Automata Types**:

* **Classic Langton's Ant (2-state RL)**: The famous ant that follows simple right/left turn rules to explore the grid.
* **Highway Builder Ant (4-state RLLR)**: An extended Langton's Ant that creates highway-like patterns with four color states.
* **Chaotic Weaver Turmite**: A unique Turmite with intricate movement patterns and chaotic growth.
* **Square Dancer (Enhanced Dragonfly)**: An improved square-drawing automaton with wandering behavior and variable square sizes.
* **Spiral Growth Turmite**: A special type of Turmite that grows in a spiral pattern, showcasing more complex forms.

### 🎮 **Interactive Controls**:

* **Start/Pause and Reset Simulation**: Control the flow of the simulation with start, pause, and reset options.
* **Adjustable Speed (1-200 steps/frame)**: Fine-tune the simulation speed for optimal performance or visual enjoyment.
* **Dynamic Cell Size (2-8px)**: Adjust the grid resolution in real-time for different viewing experiences.
* **Toggle Machine Types On/Off**: Activate or deactivate individual machine types in the simulation.
* **Set Quantity for Each Machine Type**: Define how many instances of each machine type will run simultaneously.
* **Custom Color Schemes**: Assign unique color sequences to different machine types to easily distinguish between them.

### 🌍 **Environmental Features**:

* **Obstacles/Rocks**: Add barriers that machines bounce off, creating interesting pattern disruptions.
* **Maze Structures**: Generate maze-like environments for machines to navigate.
* **Food Particles**: Scatter collectible food that affects machine behavior when consumed.
* **Adjustable Density (0-30%)**: Control the density of environmental features.
* **Clear Environment**: Reset all environmental modifications with one click.

### 🔎 **Visualisation**:

* **Optimised HTML5 Canvas Rendering**: High-performance rendering using typed arrays and batch image data updates.
* **Real-time Statistics**: Monitor steps taken, active machines, and frames per second.
* **Distinct Colors for Trails and Active Machines**: Different colors represent machine movement and their evolving trails.
* **Clean, Professional Interface**: Minimalist design with intuitive controls and clear visual hierarchy.
* **Responsive Design**: Optimised layout with an intuitive control panel that adapts to different screen sizes.

### ⚙️ **Technical Implementation**:

* **Performance-Optimised Grid**: Uses typed arrays (Uint8Array) for massive performance improvements.
* **Efficient Batch Rendering**: Utilises putImageData for fast canvas updates instead of individual draw calls.
* **Color Indexing System**: Efficient color mapping for quick lookups and reduced memory usage.
* **Wrapping Grid Boundaries**: The grid "wraps" around, ensuring automata continue moving indefinitely.
* **Collision Detection**: Machines interact with obstacles and environmental features.
* **Modular Machine Configuration**: Easily extendable with new machine types, rules, and behaviors.
* **Stateful Turmite Rule Engine**: Each Turmite has its own state machine with complex transition rules.

---

## 🏁 Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/JonathanTheofilas/langtons-bug-farm.git
cd langtons-bug-farm
```

### 2. **Open in Browser**

Simply open the `index.html` file in any modern web browser (Chrome, Firefox, Edge, etc.).

### 3. **Interact with the Simulation**:

* Use the control panel to adjust the settings and parameters.
* Add environmental features using the Environment controls.
* Toggle different machine types on/off to control which automata are active.
* Modify the quantity of each automaton type running on the grid.
* Adjust the simulation speed using the speed slider.
* Create custom machines using the "Add Custom Machine" button.

---

## ⚙️ Configuration

The behavior and appearance of machines can be customised by editing the `machineConfigs` array in `script.js`. Here's an example configuration:

```javascript
const machineConfigs = [
    {
        name: "Custom Ant",
        type: 'ant',  // Automaton type
        defaultQuantity: 3,  // How many to spawn by default
        enabled: true,  // Whether this machine is enabled
        colorSequence: ['#000000', '#FF0000', '#00FF00'],  // Colors for each state
        rules: 'RLLR'  // The rule set (R for right, L for left turns)
    },
    {
        name: "Custom Turmite",
        type: 'turmite',
        defaultQuantity: 1,
        enabled: true,
        colorSequence: ['#101010', '#FF5733', '#33FF57'],
        rules: {
            0: [[1, 1, 0], [2, -1, 1]],
            1: [[0, -1, 1], [1, 1, 0]]
        }
    },
    {
        name: "Custom Dragonfly",
        type: 'dragonfly',
        defaultQuantity: 2,
        enabled: true,
        colorSequence: ['#101010', '#87CEEB', '#FFD700'],
        dartLength: 12,  // Length of each square side
        wanderProbability: 0.1  // Chance to wander after completing a square
    }
];
```

---

## 🗂️ Project Structure

```text
langtons-bug-farm/
├── index.html          # Main HTML file for the simulation
├── style.css           # Stylesheet for the simulation's layout and design
├── script.js           # Core logic and simulation engine
└── README.md           # Documentation (this file)
```

---

## ⚙️ How It Works

The simulation runs on a grid-based approach where each cell can be in a specific state, represented by colors. Different automata ("machines") interact with this grid by following their own sets of rules. Here's how each type of machine works:

1. **Langton's Ant**:

   * Moves based on simple rules (R for right turn, L for left turn).
   * Flips the color of the cell it moves from.
   * Can consume food particles which randomly alter direction.

2. **Turmites**:

   * These state machines have complex rules that dictate their movement and cell color transitions.
   * Rules are defined as state transition tables with [newColor, turn, newState] format.

3. **Square Dancer (Dragonfly)**:

   * Draws squares of configurable size on the grid.
   * After completing a square, may wander randomly or start a new square.
   * Varies square sizes dynamically for more interesting patterns.

4. **Spiral Growth Turmites**:

   * Follow a spiral path, evolving into more intricate shapes over time.
   * Create organic-looking growth patterns.

### Each machine follows these general steps:

1. **Checks for obstacles** - bounces off if encountered.
2. **Checks for food** - consumes and potentially changes behavior.
3. **Reads the color** of the current cell it's located at.
4. **Updates the cell** based on its rule set.
5. **Turns** according to its transition rules (e.g., left or right).
6. **Moves forward** by one cell.
7. **Repeats** the process indefinitely.

---

## 🎨 User Interface

### **Custom Machine Editor**:

The simulation includes a built-in machine editor that allows you to:

* Create new ant, turmite, or dragonfly machines
* Define custom color sequences
* Set transition rules (for ants and turmites)
* Configure movement parameters (for dragonflies)

### **Real-time Statistics**:

Monitor your simulation with live statistics including:

* Total steps taken
* Number of active machines
* Current frames per second (FPS)

### **Environmental Controls**:

Modify the simulation environment dynamically:

* **Rocks**: Add random rock formations
* **Maze**: Generate maze-like structures
* **Food**: Scatter food particles
* **Density**: Control how dense environmental features are

---

## 🛠️ Customisation Options

### 1. **Add New Machine Types**:

* Use the "Add Custom Machine" button in the UI for easy creation.
* Or expand the functionality by adding new machine configurations to the `machineConfigs` array in `script.js`.

### 2. **Modify Existing Machine Rules and Colors**:

* Edit the transition rules and color sequences to suit your needs. Experiment with different patterns and behaviors!

### 3. **Adjust Grid Dimensions and Cell Size**:

The grid automatically adjusts based on cell size. Use the Cell Size slider in the UI or customise in code:

```javascript
this.cellSize = 4;  // Size of each cell in pixels (2-8)
this.width = 800;   // Canvas width in pixels
this.height = 640;  // Canvas height in pixels
```

### 4. **Change Simulation Speed**:

Control the simulation speed using either the speed slider in the UI or directly in the code:

```javascript
this.stepsPerFrame = 50; // Adjust this value for faster/slower simulations
```

### 5. **Optimise Performance**:

The simulation uses several optimisation techniques:

* Typed arrays for grid storage
* Batch rendering with putImageData
* Color indexing for efficient lookups
* Configurable cell size for performance tuning

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions to make this project even better! You can help by submitting issues or pull requests for:

* **Bug Fixes**: Improve the stability and performance of the simulation.
* **New Machine Implementations**: Add additional automata types or features.
* **Performance Enhancements**: Optimise the code for better speed or efficiency.
* **UI Improvements**: Improve the user interface for a better experience.
* **Environmental Features**: Add new types of obstacles or interactive elements.

Feel free to open an issue or submit a pull request for any ideas, enhancements, or fixes!