# Learn inkjs - Text-Based RPG Tutorial

A comprehensive tutorial for building interactive text-based RPGs using **inkjs** (Inkle's Ink scripting language) and **React**.

![inkjs](https://img.shields.io/badge/inkjs-v2.3.2-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)

## Overview

This repository contains a complete hands-on tutorial for creating text-based role-playing games with combat systems, branching narratives, and dynamic adventure loading. The tutorial is designed for developers who want to learn interactive fiction development using industry-standard tools.

**inkjs** is a JavaScript port of Inkle's Ink scripting language, originally used in acclaimed games like "80 Days" and "A Highland Song". It's now the foundation for building web-based interactive narratives and RPGs.

## What You'll Learn

- **Ink Language Fundamentals** - Variables, knots, conditional logic, and functions
- **Combat System Design** - Turn-based combat, enemy AI, magic systems, and boss battles
- **React Integration** - Building responsive UI components with modern React patterns
- **Adventure Architecture** - Creating modular, swappable adventure modules
- **State Management** - Handling player stats, inventory, and game progression
- **Save/Load Systems** - Implementing persistent game states

## Project Structure

```
learn-inkjs/
├── TUTORIAL.md           # Complete tutorial documentation (11 sections)
├── README.md             # This file
├── rpg-frontend/         # React frontend application
│   ├── src/
│   │   ├── components/   # UI components (CombatSystem, StoryDisplay, etc.)
│   │   ├── hooks/        # Custom React hooks for inkjs integration
│   │   ├── utils/        # Utility functions (inkLoader, combatLogic)
│   │   └── types/        # TypeScript type definitions
│   └── public/
│       └── adventures/   # Sample adventure modules (.json files)
```

## Quick Start

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Modern web browser
- Code editor (VS Code recommended)

### Installation

```bash
# Clone or navigate to the project
cd learn-inkjs

# Create React frontend
npx create-react-app rpg-frontend --template typescript

# Or using Vite (faster)
npm create vite@latest rpg-frontend -- --template react-ts

# Navigate to frontend
cd rpg-frontend

# Install dependencies
npm install inkjs react-router-dom uuid @types/uuid
```

### Run the Project

```bash
cd rpg-frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view in browser.

## Tutorial Sections

The complete tutorial is available in **[TUTORIAL.md](TUTORIAL.md)** covering:

1. **Introduction** - Overview of inkjs and project goals
2. **Prerequisites** - Required software and knowledge
3. **Environment Setup** - Project initialization and structure
4. **Ink Language Basics** - Syntax, variables, and logic
5. **Combat Systems** - Implementing turn-based combat
6. **React Frontend** - Building the game UI
7. **Integration** - Connecting inkjs with React
8. **Adventure Loading** - Dynamic module system
9. **Advanced Combat** - Status effects, combos, bosses
10. **Best Practices** - Performance and optimization
11. **Resources** - External links and documentation

## Key Features

### Combat System
- Turn-based battle mechanics
- Player and enemy stats (HP, MP, Attack, Defense)
- Critical hits and damage variance
- Magic and special abilities
- Enemy variety and boss battles
- Status effects (poison, paralysis, burning)
- Combo system with multipliers

### Adventure System
- Modular adventure loading
- Dynamic story content
- Save/load functionality
- Progress tracking
- Multiple adventure support
- Adventure selector interface

### React Components
- `StoryDisplay` - Renders story text with tags
- `CombatSystem` - Turn-based combat interface
- `ChoiceButtons` - Story choice navigation
- `AdventureSelector` - Adventure selection UI
- `StatsDisplay` - Player stats visualization

## Example Ink Combat Script

```ink
=== start_combat ===
VAR enemy_hp = 50
VAR player_hp = 100

A Goblin appears!

* [Attack] -> player_attack
* [Cast Fireball] -> cast_fireball
* [Defend] -> defend_action

=== player_attack ===
~ damage = 15 + RANDOM(1, 10)
~ enemy_hp = enemy_hp - damage
You hit the Goblin for {damage} damage!

{enemy_hp <= 0:
    -> victory
- else:
    -> enemy_turn
}
```

## Resources

### Official Documentation
- [inkjs GitHub](https://github.com/y-lohse/inkjs)
- [Ink Language Documentation](https://github.com/inkle/ink/tree/main/Documentation)
- [Inky Editor](https://github.com/inkle/ink/releases)
- [Ink Web Tutorial](https://www.inklestudios.com/ink/web-tutorial/)

### Tutorial Links
- [InkGameScript Getting Started](https://inkgamescript.online/blog/getting-started-with-inkgamescript.html)
- [JavaScript + Ink: Story API](https://videlais.com/2019/05/27/javascript-ink-part-2-story-api/)
- [React + Ink CLI Tutorial](https://www.freecodecamp.org/news/react-js-ink-cli-tutorial/)

### Community
- [Inkle Studios Forum](https://forum.inklestudios.com/)
- r/interactivefiction - Reddit
- [inkjs GitHub Discussions](https://github.com/y-lohse/inkjs/discussions)

## Games Using Ink

This tutorial teaches tools used in award-winning games:

- **80 Days** - Inkle Studios, BAFTA winner
- **A Highland Song** - Nintendo Switch & PC
- **Bury Me My Love** - IGF nominee
- **Where the Water Tastes Like Wine** - IGF nominee

## Contributing

This is a learning project. Feel free to:

- Submit issues with questions
- Suggest improvements to the tutorial
- Add new adventure modules to `public/adventures/`
- Share your creations!

## License

This tutorial is open source and available under the MIT License.

## Author

Created for developers who want to learn interactive fiction and game development using modern web technologies.

---

**Start your adventure!** Begin with [TUTORIAL.md](TUTORIAL.md) and build your first text-based RPG.