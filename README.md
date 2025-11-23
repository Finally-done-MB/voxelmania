# Voxel Robots

A relaxing, fun way to spend a few minutes. Generate unique 3D voxel creations—robots, spaceships, animals, and monsters—then watch them crumble, explode, and interact with physics. Perfect for unwinding before sleep, passing time at the airport, or taking a quick break during lunch.

No pressure, no goals, just simple creative fun.

## What You Can Do

**Create** unique voxel objects across 4 categories:

- 🤖 Robots (with diverse body types, tools, and decorations)
- 🚀 Spaceships (fighters, cargo ships, explorers)
- 🐾 Animals (wolves, cats, birds, and more)
- 👹 Monsters (various creatures)

**Interact** with your creations:

- Watch them auto-rotate and explore from different angles
- Make them crumble gently or explode dramatically
- Click on debris to apply forces and see physics in action
- Enjoy ambient music and satisfying sound effects (or keep it quiet)

**Save & Share**:

- Save your favorite creations to your gallery
- Export as images or share seeds to recreate objects
- Build your collection over time

**Works everywhere**: Optimized for both desktop and mobile, so you can relax wherever you are.

## Live Demo

[Coming soon - will be deployed to Cloudflare Pages]

## Quick Start

### For Users

Just visit the live demo when it's available—no installation needed! Works right in your browser.

### For Developers

1. Clone the repository:

   ```bash
   git clone https://github.com/Finally-done-MB/voxelmania.git
   cd voxelmania
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser

## How to Use

1. Pick a category (Robots, Spaceships, Animals, or Monsters)
2. Click "GENERATE" to create something new
3. Watch it rotate, or click "CRUMBLE" or "EXPLODE" to see physics in action
4. Click on debris piles to interact with them
5. Save favorites to your gallery
6. Export as images or share seeds with others

That's it! No tutorials, no complexity—just fun.

## Contributing

Contributions are welcome! This project is licensed under AGPL v3, which means:

- You can use, modify, and distribute the code
- If you modify and distribute, you must open-source your changes
- Commercial use of the code requires open-sourcing modifications

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests if applicable.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

See the [LICENSE](LICENSE) file for details.

## Tech Stack

For developers interested in the implementation:

- **Frontend**: React 19 + TypeScript
- **3D Rendering**: Three.js + React Three Fiber
- **Physics**: @react-three/rapier
- **Audio**: Web Audio API (procedural synthesis)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React

## Acknowledgments

- Built with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) and [Three.js](https://threejs.org/)
- Physics powered by [Rapier](https://rapier.rs/)
- Audio synthesis using Web Audio API
