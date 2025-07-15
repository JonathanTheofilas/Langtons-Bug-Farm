# Langton's Vibers: Advanced Cellular Automata Playground

**Langton's Vibers** is an interactive, visual simulation of various cellular automata, including Langton's Ant, Turmites, and other Turing machines. Explore and experiment with multiple automaton types in a shared environment, each featuring customisable rules, behaviors, and controls.

---

## 🚀 Features

### 🌐 **Multiple Automata Types**:

* **Classic Langton's Ant (2-state RL)**: The famous ant that follows simple right/left turn rules to explore the grid.
* **3-Color Ant (3-state RLL)**: A variation of Langton's Ant with a third state for more complex behavior.
* **Chaotic Weaver Turmite**: A unique Turmite with intricate movement patterns and chaotic growth.
* **Dragonfly**: A square-drawing automaton that moves in random directions to draw squares on the grid.
* **Spiral Growth Turmite**: A special type of Turmite that grows in a spiral pattern, showcasing more complex forms.

### 🎮 **Interactive Controls**:

* **Start/Pause and Reset Simulation**: Control the flow of the simulation with start, pause, and reset options.
* **Adjustable Speed (1-200 steps/frame)**: Fine-tune the simulation speed for optimal performance or visual enjoyment.
* **Toggle Machine Types On/Off**: Activate or deactivate individual machine types in the simulation.
* **Set Quantity for Each Machine Type**: Define how many instances of each machine type will run simultaneously.
* **Custom Color Schemes**: Assign unique color sequences to different machine types to easily distinguish between them.

### 🔎 **Visualisation**:

* **Real-time HTML5 Canvas Rendering**: Visualise the automata and their progress in real-time with smooth animation.
* **Distinct Colors for Trails and Active Machines**: Different colors represent machine movement and their evolving trails.
* **Responsive Design**: Optimised layout with an intuitive control panel that adapts to different screen sizes.

### ⚙️ **Technical Implementation**:

* **Wrapping Grid Boundaries**: The grid "wraps" around, ensuring automata continue moving indefinitely.
* **Efficient Batch Processing**: Ensures fast computation even with large grids or many automata.
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
* Toggle different machine types on/off to control which automata are active.
* Modify the quantity of each automaton type running on the grid.
* Adjust the simulation speed using the speed slider.

---

## ⚙️ Configuration

The behavior and appearance of machines can be customised by editing the `machineConfigs` array in `script.js`. Here’s an example configuration:

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

1. **Langton’s Ant**:

   * Moves based on simple rules (R for right turn, L for left turn).
   * Flips the color of the cell it moves from.
2. **Turmites**:

   * These state machines have complex rules that dictate their movement and cell color transitions.
3. **Dragonflies**:

   * Draw squares by moving randomly on the grid, periodically changing direction.
4. **Spiral Growth Turmites**:

   * Follow a spiral path, evolving into more intricate shapes over time.

### Each machine follows these general steps:

1. **Reads the color** of the current cell it's located at.
2. **Updates the cell** based on its rule set.
3. **Turns** according to its transition rules (e.g., left or right).
4. **Moves forward** by one cell.
5. **Repeats** the process indefinitely.

---

## 🛠️ Customisation Options

### 1. **Add New Machine Types**:

* Expand the functionality by adding new machine configurations to the `machineConfigs` array in `script.js`.

### 2. **Modify Existing Machine Rules and Colors**:

* Edit the transition rules and color sequences to suit your needs. Experiment with different patterns and behaviors!

### 3. **Adjust Grid Dimensions and Cell Size**:

Customise the grid and cell size for larger or more detailed visualisations:

```javascript
const width = 1000;  // Width of the grid in pixels
const height = 800;  // Height of the grid in pixels
const cellSize = 4;  // Size of each cell in pixels
```

### 4. **Change Simulation Speed**:

Control the simulation speed using either the speed slider in the UI or directly in the code:

```javascript
let stepsPerFrame = 50; // Adjust this value for faster/slower simulations
```

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

Feel free to open an issue or submit a pull request for any ideas, enhancements, or fixes!
