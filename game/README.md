# S.E.E.D 118 — Game

This directory contains the game itself.

The game is built to run directly in the browser using PixiJS.

## Project Structure

```
game/
├── packages/
│   ├── sim/          # Core simulation logic (deterministic, state-owning)
│   ├── render/       # PixiJS rendering layer (read-only view)
│   ├── runtime/      # Game loop, input, platform abstraction
│   └── ui/           # UI components and HUD
├── apps/
│   └── web/          # Browser application entry point
├── assets/           # Sprites, audio, fonts
├── tools/            # Build scripts, dev utilities
└── coverage/         # Test coverage reports
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

## Development

### Running Tests

```bash
# Run all tests once
npm test

# Run with coverage report
npm run coverage
```

### Test Coverage

Coverage reports are generated in `coverage/` and include:
- Line coverage
- Branch coverage
- Function coverage
- HTML report at `coverage/lcov-report/index.html`

### Writing Tests

The project uses **Vitest** for testing.

**Unit tests** are located in `packages/*/test/unit/`  
**Integration tests** are in `packages/*/test/integration/`

## Packages

### `packages/sim`

Core simulation package containing:
- World state management
- Command system
- Grid and chunk logic
- Structure and resource definitions
- Deterministic world generation

### `packages/render`

PixiJS rendering layer:
- Sprite management
- Tilemap rendering
- Camera system
- Visual effects

### `packages/runtime`

Game loop and platform:
- Fixed-step simulation loop
- Input handling
- Browser platform adapter

### `packages/ui`

User interface:
- HUD components
- Menus
- Tool panels
- State bindings (read-only)