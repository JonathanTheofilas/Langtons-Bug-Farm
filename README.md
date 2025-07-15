# Langton's Vibers: Advanced Cellular Automata Playground
An interactive visualisation of Langton's Ant and other Turing machines in a shared environment, featuring multiple concurrent automata types with customisable rules and behaviors.

## Features
- Multiple Automata Types:
  - Classic Langton's Ant (2-state RL)
  - 3-Color Ant (3-state RLL)
  - Chaotic Weaver Turmite
  - Dragonfly (square-drawing automaton)
  - Spiral Growth Turmite
- Interactive Controls:
  - Start/Pause and Reset simulation
  - Adjustable speed (1-200 steps/frame)
  - Toggle individual machine types on/off
  - Set quantity for each machine type
  - Custom color schemes per machine
- Visualisation:
  - Real-time HTML5 Canvas rendering
  - Distinct colors for trails and active machines
  - Responsive design with control panel
- Technical Implementation:
  - Wrapping grid boundaries
  - Efficient batch processing
  - Modular machine configuration
  - Stateful Turmite rule engine
 
## Getting Started
1. Clone the repository
```bash
git clone https://github.com/your-username/langtons-vibers.git
cd langtons-vibers
```
2. Open in browser:
Simply open index.html in any modern web browser
3. Interact with the simulation:
  - Use the control panel to adjust settings
  - Toggle different machine types on/off
  - Modify quantities for each automaton type
  - Adjust speed using the slider

## Configuration
Customize machines by editing the machineConfigs array in script.js:
``` javascript
const machineConfigs = [
    {
        name: "Custom Ant",
        type: 'ant',
        defaultQuantity: 3,
        enabled: true,
        colorSequence: ['#000000', '#FF0000', '#00FF00'],
        rules: 'RLLR'
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
## Project Structure
``` text
langtons-vibers/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # Core simulation logic
└── README.md           # This documentation
```
## How It Works
The simulation uses a grid-based approach where each cell can be in different states (represented by colors). Various automata ("machines") move according to specific rules:
1. Ants: Follow simple turn rules (R for right, L for left)
2. Turmites: State machines with complex transition rules
3. Dragonflies: Draw squares and randomly reorient
Each machine:
1. Reads the color at its current position
2. Updates the cell color based on its rules
3. Turns according to its rule set
4. Moves forward one cell
5. Repeats the process

## Customization Options
1. Add new machine types to machineConfigs
2. Modify existing machine rules and colors
3. Adjust grid dimensions and cell size:
``` javascript
const width = 1000;
const height = 800;
const cellSize = 4;
```
4. Change simulation speed via the slider or code:
``` javascript
let stepsPerFrame = 50; // Adjust for performance
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any:
- Bug fixes
- New machine implementations
- Performance improvements
- UI enhancements
