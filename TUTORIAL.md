# Complete Guide to Building Text-Based RPGs with inkjs and React

This comprehensive tutorial will guide you through creating a text-based RPG with combat mechanics, integrating it with React.js, and building a platform to load different adventures.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Setting Up the Development Environment](#setting-up-the-development-environment)
4. [Understanding Ink Language Basics](#understanding-ink-language-basics)
5. [Creating Combat Systems in Ink](#creating-combat-systems-in-ink)
6. [Building the React Frontend](#building-the-react-frontend)
7. [Integrating inkjs with React](#integrating-inkjs-with-react)
8. [Creating an Adventure Loading System](#creating-an-adventure-loading-system)
9. [Advanced Combat Mechanics](#advanced-combat-mechanics)
10. [Best Practices and Optimization](#best-practices-and-optimization)
11. [Additional Resources](#additional-resources)

---

## Introduction

**inkjs** is a JavaScript port of Inkle's Ink scripting language, designed for creating interactive narrative experiences. Originally used in acclaimed games like "80 Days" and "A Highland Song", Ink provides a powerful yet accessible way to write branching stories with complex logic and state management.

This tutorial will show you how to:
- Create a text-based RPG engine using Ink scripts
- Implement turn-based combat mechanics
- Build a React frontend interface
- Design a system to load multiple adventure modules
- Deploy your RPG platform to the web

**Key Features We'll Implement:**
- Player stats and attributes (HP, MP, attack power, defense)
- Enemy AI and combat turns
- Inventory system
- Multiple story branches
- Save/load functionality
- Adventure selector interface

**Source:** [inkjs GitHub Repository](https://github.com/y-lohse/inkjs)

---

## Prerequisites

Before starting this tutorial, ensure you have:

**Required Software:**
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm or yarn package manager
- A modern web browser (Chrome, Firefox, Edge)
- Code editor (VS Code recommended) - [Download here](https://code.visualstudio.com/)

**Recommended Knowledge:**
- Basic JavaScript/TypeScript understanding
- React fundamentals (components, state, hooks)
- CSS/SCSS basics
- Command line familiarity

**Optional Tools:**
- Git for version control - [Download here](https://git-scm.com/)
- Inky editor (official Ink story editor) - [Download here](https://github.com/inkle/ink/releases)

**Environment Setup Verification:**

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Create project directory
mkdir rpg-ink-tutorial
cd rpg-ink-tutorial
```

---

## Setting Up the Development Environment

### Step 1: Initialize React Project

We'll use Create React App with TypeScript for our frontend:

```bash
# Create new React project with TypeScript
npx create-react-app rpg-frontend --template typescript

# Navigate to project directory
cd rpg-frontend

# Install inkjs
npm install inkjs

# Install additional dependencies
npm install react-router-dom uuid
```

**Alternative using Vite (faster):**
```bash
npm create vite@latest rpg-frontend -- --template react-ts
cd rpg-frontend
npm install inkjs react-router-dom uuid @types/uuid
```

### Step 2: Project Structure

Create the following directory structure:

```
rpg-frontend/
├── public/
│   └── adventures/          # Store your Ink story JSON files here
│       ├── adventure1.json
│       ├── adventure2.json
│       └── adventure3.json
├── src/
│   ├── components/
│   │   ├── CombatSystem.tsx
│   │   ├── StoryDisplay.tsx
│   │   ├── ChoiceButtons.tsx
│   │   ├── AdventureSelector.tsx
│   │   └── StatsDisplay.tsx
│   ├── hooks/
│   │   ├── useInkStory.ts
│   │   └── useCombatSystem.ts
│   ├── utils/
│   │   ├── inkLoader.ts
│   │   └── combatLogic.ts
│   ├── types/
│   │   ├── adventure.ts
│   │   └── combat.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── styles/
│       └── App.css
├── package.json
├── tsconfig.json
└── README.md
```

### Step 3: Webpack Configuration (if needed)

If you're loading .ink files directly, configure Webpack to handle them:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ink$/i,
        type: 'asset/source',
      },
    ],
  },
};
```

**Source:** [inkjs Webpack Documentation](https://github.com/y-lohse/inkjs/blob/main/docs/working-with-typescript-and-webpack.md)

---

## Understanding Ink Language Basics

### 1. Ink Syntax Fundamentals

Ink uses a simple, indentation-based syntax. Here's the basic structure:

```ink
=== start ===
Welcome, adventurer! What is your name?

* "My name is Aria" -> set_name
* "I am called Kael" -> set_name
* [Remain silent] -> silent_start

=== set_name ===
VAR player_name = ""
VAR player_hp = 100
VAR player_mp = 50
VAR attack_power = 15
VAR defense_power = 10

You tell them your name is {player_name}.

{player_name} it is. Your journey begins now... -> intro_battle
```

### 2. Variables and State

Ink supports various variable types:

```ink
=== game_start ===
VAR player_hp = 100
VAR player_mp = 50
VAR gold = 0
VAR experience = 0
VAR inventory = ()

LIST character_class = Warrior, Mage, Rogue
VAR class_choice = Warrior

LIST equipment = Sword, Bow, Staff
VAR equipped = ()

VAR enemy_hp = 50
VAR enemy_max_hp = 50
VAR enemy_name = "Goblin"

VAR combat_turn = 1
VAR in_combat = false
```

### 3. Conditional Logic

Use curly braces for conditional text:

```ink
=== check_status ===
HP: {player_hp}/{player_hp}
MP: {player_mp}/{player_mp}

{player_hp <= 25: You are critically wounded!}
{player_mp >= 40: You feel energized by your magical reserves!}
```

### 4. Knots and Links

Knots are story sections, links connect them:

```ink
=== main_hub ===
You stand in the village square. Where do you want to go?

* [Go to the tavern] -> tavern
* [Visit the blacksmith] -> blacksmith
* [Enter the forest] -> forest
* [Check your inventory] -> inventory_menu

=== tavern ===
The tavern is warm and smells of ale. What do you do?

* [Order a drink] -> order_drink
* [Ask about rumors] -> ask_rumors
* [Leave] -> main_hub
```

### 5. Choices and Branching

Multiple choices with conditional availability:

```ink
=== combat_scenario ===
VAR can_attack = true
VAR can_heal = true
VAR can_flee = true

The {enemy_name} watches you with hungry eyes.

* [Attack the enemy] {can_attack} -> attack_action
* [Cast healing spell] {can_heal && player_mp >= 10} -> heal_action
* [Try to flee] {can_flee} -> flee_action
* [Check enemy stats] -> enemy_inspection
```

### 6. Functions

Create reusable functions for common operations:

```ink
=== function damage_enemy(amount) ===
~ enemy_hp = enemy_hp - amount
{enemy_hp <= 0:
    You dealt {amount} damage! The {enemy_name} falls defeated!
    ~ experience = experience + 50
    -> victory
- else:
    You dealt {amount} damage! The {enemy_name} has {enemy_hp} HP remaining.
}
===

=== function player_attack() ===
~ damage = attack_power + RANDOM(1, 10)
~ damage_enemy(damage)
===

=== function enemy_turn() ===
~ enemy_damage = 5 + RANDOM(1, 8)
~ player_hp = player_hp - enemy_damage
The {enemy_name} attacks! You take {enemy_damage} damage.
{player_hp <= 0:
    -> game_over
}
```

**Source:** [Ink Language Documentation](https://github.com/inkle/ink/tree/main/Documentation)

---

## Creating Combat Systems in Ink

### 1. Basic Combat Structure

Here's a complete combat system implementation:

```ink
=== start_combat ===
VAR in_combat = true
VAR combat_turn = 1
VAR enemy_hp = 50
VAR enemy_max_hp = 50
VAR enemy_name = "Goblin"
VAR enemy_damage = 8

-> combat_round

=== combat_round ===
{combat_turn > 1:
    -----------------
    Turn {combat_turn}
    -----------------
}

{enemy_name} blocks your path! HP: {enemy_hp}/{enemy_max_hp}

* [Attack] -> player_attack
* [Defensive stance] -> defensive_stance
* [Use item] -> use_item
* [Analyze enemy] -> analyze_enemy
* [Try to flee] -> attempt_flee

=== player_attack ===
~ player_damage = attack_power + RANDOM(1, 10)
~ enemy_hp = enemy_hp - player_damage

You attack the {enemy_name} for {player_damage} damage!

{enemy_hp <= 0:
    -> combat_victory
- else:
    -> enemy_combat_turn
}

=== enemy_combat_turn ===
~ enemy_action = RANDOM(1, 3)
{enemy_action == 1:
    The {enemy_name} swipes at you!
    ~ player_hp = player_hp - enemy_damage
- elif enemy_action == 2:
    The {enemy_name} strikes with its weapon!
    ~ player_hp = player_hp - (enemy_damage + 2)
- else:
    The {enemy_name} growls menacingly.
}

{player_hp <= 0:
    -> combat_defeat
- else:
    ~ combat_turn = combat_turn + 1
    -> combat_round
}
```

### 2. Advanced Combat Mechanics

Add critical hits, status effects, and combo systems:

```ink
=== advanced_combat ===
VAR crit_chance = 0.2
VAR current_defense = 0
VAR combo_count = 0
VAR enemy_stunned = false
VAR player_stunned = false
VAR bleeding = false
VAR bleeding_damage = 2

=== player_crit_attack ===
~ roll = RANDOM(1, 100)
{roll <= (crit_chance * 100):
    ~ crit_damage = (attack_power * 2) + RANDOM(1, 10)
    ~ enemy_hp = enemy_hp - crit_damage
    CRITICAL HIT! You deal {crit_damage} damage!
    ~ combo_count = combo_count + 1
- else:
    ~ normal_damage = attack_power + RANDOM(1, 5)
    ~ enemy_hp = enemy_hp - normal_damage
    You deal {normal_damage} damage.
}
~ combo_count = combo_count + 1

{combo_count >= 3:
    COMBO x{combo_count}! Bonus attack!
    -> bonus_attack
}
```

### 3. Enemy Variety System

Create different enemy types with unique behaviors:

```ink
=== enemy_types ===
VAR enemy_type = "goblin"

LIST goblin_stats = 30, 6, 4
LIST orc_stats = 60, 10, 8
LIST slime_stats = 20, 4, 2
LIST boss_stats = 200, 15, 20

=== spawn_enemy ===
~ current_enemy_index = RANDOM(0, 3)
~ enemy_stats = LIST_ALL(goblin_stats)
~ enemy_stats = enemy_stats[current_enemy_index]
~ enemy_hp = enemy_stats[0]
~ enemy_max_hp = enemy_stats[0]
~ enemy_damage = enemy_stats[1]
~ defense = enemy_stats[2]

{current_enemy_index == 0:
    ~ enemy_type = "Goblin"
    ~ enemy_name = "a mischievous Goblin"
- elsif current_enemy_index == 1:
    ~ enemy_type = "Orc"
    ~ enemy_name = "a fierce Orc warrior"
- elsif current_enemy_index == 2:
    ~ enemy_type = "Slime"
    ~ enemy_name = "a bouncing Slime"
- else:
    ~ enemy_type = "Boss"
    ~ enemy_name = "the Dark Knight"
}
```

### 4. Magic and Special Abilities

```ink
=== magic_system ===
VAR fire_mp_cost = 15
VAR ice_mp_cost = 12
VAR heal_mp_cost = 20
VAR thunder_mp_cost = 25

=== cast_fire ===
{player_mp >= fire_mp_cost:
    ~ player_mp = player_mp - fire_mp_cost
    ~ fire_damage = 25 + RANDOM(5, 15)
    ~ enemy_hp = enemy_hp - fire_damage
    
    You cast Fireball! Flames engulf the {enemy_name} for {fire_damage} damage!
    
    {RANDOM(1, 100) <= 30:
        ~ enemy_stunned = true
        The enemy is burned and stunned!
    }
    
    -> check_enemy_defeat
- else:
    Not enough MP! You need {fire_mp_cost} MP.
    -> combat_round
}

=== cast_heal ===
{player_mp >= heal_mp_cost:
    ~ player_mp = player_mp - heal_mp_cost
    ~ heal_amount = 30 + RANDOM(10, 20)
    ~ player_hp = player_hp + heal_amount
    
    {player_hp > player_max_hp:
        ~ player_hp = player_max_hp
    }
    
    You cast Heal! Recovered {heal_amount} HP.
    -> enemy_combat_turn
- else:
    Not enough MP! You need {heal_mp_cost} MP.
    -> combat_round
}
```

### 5. Complete Combat Example

Here's a fully functional combat scene you can use:

```ink
=== start_adventure ===
Welcome to the Dark Forest adventure!

What is your character name?
* "Aria" -> set_aria
* "Kael" -> set_kael
* "Lira" -> set_lira

=== set_aria ===
~ player_name = "Aria"
~ player_class = "Warrior"
~ attack_power = 18
~ defense_power = 12
~ magic_power = 5
~ player_hp = 120
~ player_max_hp = 120
~ player_mp = 40
~ experience = 0
~ gold = 50

Aria the Warrior enters the dark forest... -> forest_encounter

=== set_kael ===
~ player_name = "Kael"
~ player_class = "Mage"
~ attack_power = 8
~ defense_power = 6
~ magic_power = 25
~ player_hp = 80
~ player_max_hp = 80
~ player_mp = 100
~ experience = 0
~ gold = 30

Kael the Mage enters the dark forest... -> forest_encounter

=== set_lira ===
~ player_name = "Lira"
~ player_class = "Rogue"
~ attack_power = 14
~ defense_power = 8
~ magic_power = 10
~ player_hp = 95
~ player_max_hp = 95
~ player_mp = 60
~ experience = 0
~ gold = 45

Lira the Rogue enters the dark forest... -> forest_encounter

=== forest_encounter ===
~ enemy_hp = 40
~ enemy_max_hp = 40
~ enemy_damage = 8
~ enemy_name = "Wolf"
~ combat_turn = 1
~ in_combat = true

A {enemy_name} appears! Its eyes glow menacingly.

STATISTICS:
HP: {player_hp}/{player_max_hp} | MP: {player_mp}
Attack: {attack_power} | Defense: {defense_power}

{enemy_name} HP: {enemy_hp}/{enemy_max_hp}

* [Attack] -> attack_wolf
* [Defensive stance] -> defend_wolf
* [Use magic] -> magic_wolf
* [Throw a stone] -> distract_wolf
* [Check inventory] -> check_gear

=== attack_wolf ===
~ damage = attack_power + RANDOM(1, 10) - 2
~ enemy_hp = enemy_hp - damage

You strike the {enemy_name} with your weapon! {damage} damage dealt.

{enemy_hp <= 0:
    -> wolf_victory
- else:
    -> wolf_attack
}

=== wolf_attack ===
~ damage = enemy_damage + RANDOM(1, 4) - defense_power
{damage < 1:
    ~ damage = 1
}
~ player_hp = player_hp - damage

The {enemy_name} bites you! You take {damage} damage.

{player_hp <= 0:
    -> wolf_defeat
- else:
    ~ combat_turn = combat_turn + 1
    -> combat_round_menu
}

=== combat_round_menu ===
Turn {combat_turn}

{enemy_name} HP: {enemy_hp}/{enemy_max_hp}

* [Attack] -> attack_wolf
* [Defensive stance] -> defend_wolf
* [Use magic] -> magic_wolf
* [Throw a stone] -> distract_wolf
* [Check inventory] -> check_gear
* [Flee] -> flee_attempt

=== wolf_victory ===
The {enemy_name} collapses! Victory!

~ experience = experience + 75
~ gold = gold + 15

Gained 75 XP and 15 gold!

{experience >= 100:
    -> level_up
- else:
    -> post_combat_menu
}

=== wolf_defeat ===
The darkness takes you... Game Over.

* [Restart] -> start_adventure

=== flee_attempt ===
~ flee_roll = RANDOM(1, 100)
{flee_roll <= 40:
    You managed to escape! But honor lost...
    -> main_menu
- else:
    The {enemy_name} blocks your escape!
    -> wolf_attack
}
```

**Source:** [Ink Combat Examples](https://github.com/inkle/ink/tree/main/Documentation/RunningYourInk.md)

---

## Building the React Frontend

### 1. Type Definitions

Create type definitions for your RPG system:

```typescript
// src/types/adventure.ts
export interface AdventureMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedPlaytime: string;
  thumbnailUrl?: string;
}

export interface Adventure {
  metadata: AdventureMetadata;
  storyContent: string;
}

export interface PlayerStats {
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magic: number;
  experience: number;
  level: number;
  gold: number;
}

export interface EnemyStats {
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  type: string;
}

export interface CombatState {
  inCombat: boolean;
  enemy: EnemyStats | null;
  combatLog: string[];
  isPlayerTurn: boolean;
}

// src/types/combat.ts
export interface CombatAction {
  type: 'attack' | 'defend' | 'magic' | 'item' | 'flee';
  value?: number;
  target?: string;
  description?: string;
}

export interface CombatResult {
  damage: number;
  isCritical: boolean;
  message: string;
  enemyDefeated: boolean;
  playerDefeated: boolean;
}
```

### 2. Adventure Loader Utility

```typescript
// src/utils/inkLoader.ts
import { Adventure, AdventureMetadata } from '../types/adventure';

const ADVENTURES_PATH = '/adventures';

export const loadAdventureList = async (): Promise<AdventureMetadata[]> => {
  try {
    const response = await fetch(`${ADVENTURES_PATH}/index.json`);
    if (!response.ok) {
      throw new Error('Failed to load adventure index');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading adventures:', error);
    return [];
  }
};

export const loadAdventure = async (adventureId: string): Promise<Adventure | null> => {
  try {
    const response = await fetch(`${ADVENTURES_PATH}/${adventureId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load adventure: ${adventureId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading adventure ${adventureId}:`, error);
    return null;
  }
};

export const exportAdventure = (adventure: Adventure): string => {
  return JSON.stringify(adventure, null, 2);
};
```

### 3. Combat Logic Utility

```typescript
// src/utils/combatLogic.ts
import { CombatResult, CombatAction } from '../types/combat';
import { PlayerStats, EnemyStats } from '../types/adventure';

export const calculateDamage = (
  attacker: PlayerStats | EnemyStats,
  defender: PlayerStats | EnemyStats,
  action: CombatAction
): CombatResult => {
  const isPlayer = 'maxMp' in attacker;
  const baseDamage = attacker.attack || attacker.damage || 10;
  const defense = 'defense' in defender ? defender.defense : 5;
  
  const variance = Math.floor(Math.random() * 10) - 5;
  let damage = baseDamage + variance - Math.floor(defense / 3);
  damage = Math.max(1, damage);
  
  const isCritical = Math.random() < 0.2;
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }
  
  const typeMultiplier = action.type === 'magic' ? 1.5 : 1;
  damage = Math.floor(damage * typeMultiplier);
  
  return {
    damage,
    isCritical,
    message: `${isPlayer ? 'You' : 'Enemy'} deal${isCritical ? ' a CRITICAL HIT' : ''} ${damage} damage!`,
    enemyDefeated: false,
    playerDefeated: false,
  };
};

export const createEnemy = (type: string, level: number): EnemyStats => {
  const enemyTypes: Record<string, { hp: number; damage: number; name: string }> = {
    goblin: { hp: 30 + level * 5, damage: 5 + level, name: 'Goblin' },
    orc: { hp: 50 + level * 8, damage: 8 + level * 2, name: 'Orc' },
    slime: { hp: 20 + level * 3, damage: 3 + level, name: 'Slime' },
    dragon: { hp: 100 + level * 15, damage: 15 + level * 3, name: 'Dragon' },
  };
  
  const template = enemyTypes[type] || enemyTypes.goblin;
  
  return {
    ...template,
    maxHp: template.hp,
    type,
  };
};
```

### 4. useInkStory Hook

Create a custom hook for managing ink story state:

```typescript
// src/hooks/useInkStory.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Story } from 'inkjs';
import { PlayerStats, CombatState } from '../types/adventure';

interface InkStoryState {
  currentText: string;
  choices: string[];
  currentTags: string[];
  canContinue: boolean;
}

export const useInkStory = (storyContent: string) => {
  const storyRef = useRef<Story | null>(null);
  const [state, setState] = useState<InkStoryState>({
    currentText: '',
    choices: [],
    currentTags: [],
    canContinue: false,
  });
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    name: '',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
    magic: 5,
    experience: 0,
    level: 1,
    gold: 0,
  });
  
  const [combatState, setCombatState] = useState<CombatState>({
    inCombat: false,
    enemy: null,
    combatLog: [],
    isPlayerTurn: true,
  });
  
  useEffect(() => {
    if (storyContent) {
      storyRef.current = new Story(storyContent);
      continueStory();
    }
  }, [storyContent]);
  
  const continueStory = useCallback(() => {
    const story = storyRef.current;
    if (!story) return;
    
    let text = '';
    if (story.canContinue) {
      text = story.Continue();
    }
    
    const choices: string[] = [];
    story.currentChoices.forEach((choice) => {
      choices.push(choice.text);
    });
    
    const tags = story.currentTags || [];
    
    setState({
      currentText: text,
      choices,
      currentTags: tags,
      canContinue: story.canContinue || story.currentChoices.length > 0,
    });
  }, []);
  
  const makeChoice = useCallback((choiceIndex: number) => {
    const story = storyRef.current;
    if (!story) return;
    
    story.ChooseChoiceIndex(choiceIndex);
    continueStory();
  }, [continueStory]);
  
  const getVariable = useCallback((name: string) => {
    const story = storyRef.current;
    if (!story) return null;
    return story.variablesState[name];
  }, []);
  
  const setVariable = useCallback((name: string, value: any) => {
    const story = storyRef.current;
    if (!story) return;
    story.variablesState[name] = value;
  }, []);
  
  const evaluateFunction = useCallback((functionName: string, ...args: any[]) => {
    const story = storyRef.current;
    if (!story) return null;
    return story.EvaluateFunction(functionName, args);
  }, []);
  
  return {
    storyState: state,
    playerStats,
    combatState,
    continueStory,
    makeChoice,
    getVariable,
    setVariable,
    evaluateFunction,
    setPlayerStats,
    setCombatState,
  };
};
```

### 5. Story Display Component

```typescript
// src/components/StoryDisplay.tsx
import React, { useEffect, useRef } from 'react';

interface StoryDisplayProps {
  text: string;
  tags: string[];
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ text, tags }) => {
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [text]);
  
  const getStyleFromTags = (tags: string[]): React.CSSProperties => {
    const style: React.CSSProperties = {};
    
    tags.forEach(tag => {
      if (tag.startsWith('color:')) {
        style.color = tag.replace('color:', '');
      }
      if (tag.startsWith('bgcolor:')) {
        style.backgroundColor = tag.replace('bgcolor:', '');
      }
      if (tag === 'bold') {
        style.fontWeight = 'bold';
      }
      if (tag === 'italic') {
        style.fontStyle = 'italic';
      }
    });
    
    return style;
  };
  
  return (
    <div className="story-display" ref={textRef}>
      <div 
        className="story-text"
        style={getStyleFromTags(tags)}
      >
        {text}
      </div>
    </div>
  );
};
```

### 6. Combat System Component

```typescript
// src/components/CombatSystem.tsx
import React, { useState } from 'react';
import { PlayerStats, EnemyStats } from '../types/adventure';
import { calculateDamage, createEnemy } from '../utils/combatLogic';

interface CombatSystemProps {
  player: PlayerStats;
  onPlayerUpdate: (player: PlayerStats) => void;
  onCombatEnd: (victory: boolean, rewards?: { exp: number; gold: number }) => void;
}

export const CombatSystem: React.FC<CombatSystemProps> = ({
  player,
  onPlayerUpdate,
  onCombatEnd,
}) => {
  const [enemy, setEnemy] = useState<EnemyStats | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState('');
  
  const startCombat = (enemyType: string) => {
    const newEnemy = createEnemy(enemyType, player.level);
    setEnemy(newEnemy);
    setCombatLog([`A ${newEnemy.name} appears!`]);
    setIsPlayerTurn(true);
    setMessage('');
  };
  
  const playerAttack = () => {
    if (!enemy || !isPlayerTurn) return;
    
    const result = calculateDamage(player, enemy, { type: 'attack' });
    const newEnemyHp = enemy.hp - result.damage;
    
    setEnemy({ ...enemy, hp: newEnemyHp });
    setCombatLog(prev => [...prev, result.message]);
    setMessage(result.message);
    
    if (newEnemyHp <= 0) {
      onCombatEnd(true, { exp: 100, gold: 50 });
      setMessage('Victory!');
    } else {
      setIsPlayerTurn(false);
      setTimeout(enemyTurn, 500);
    }
  };
  
  const enemyTurn = () => {
    if (!enemy) return;
    
    const result = calculateDamage(enemy, player, { type: 'attack' });
    const newPlayerHp = player.hp - result.damage;
    
    onPlayerUpdate({ ...player, hp: newPlayerHp });
    setCombatLog(prev => [...prev, `Enemy ${result.message}`]);
    setMessage(result.message);
    
    if (newPlayerHp <= 0) {
      onCombatEnd(false);
      setMessage('Defeat...');
    } else {
      setIsPlayerTurn(true);
    }
  };
  
  const useHealingPotion = () => {
    const healAmount = 30;
    onPlayerUpdate({
      ...player,
      hp: Math.min(player.hp + healAmount, player.maxHp),
    });
    setCombatLog(prev => [...prev, `Used healing potion. Recovered ${healAmount} HP.`]);
    setIsPlayerTurn(false);
    setTimeout(enemyTurn, 500);
  };
  
  return (
    <div className="combat-system">
      {enemy ? (
        <>
          <div className="combat-header">
            <div className="player-stats">
              <h3>{player.name}</h3>
              <div className="hp-bar">
                <div 
                  className="hp-fill" 
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
                <span>{player.hp}/{player.maxHp} HP</span>
              </div>
            </div>
            
            <div className="enemy-stats">
              <h3>{enemy.name}</h3>
              <div className="hp-bar">
                <div 
                  className="hp-fill enemy" 
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
                <span>{enemy.hp}/{enemy.maxHp} HP</span>
              </div>
            </div>
          </div>
          
          <div className="combat-log">
            {combatLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
            {message && <p className="combat-message">{message}</p>}
          </div>
          
          <div className="combat-actions">
            {isPlayerTurn ? (
              <>
                <button onClick={playerAttack}>Attack</button>
                <button onClick={useHealingPotion}>Healing Potion</button>
                <button>Flee</button>
              </>
            ) : (
              <p>Enemy's turn...</p>
            )}
          </div>
        </>
      ) : (
        <button onClick={() => startCombat('goblin')}>Start Combat</button>
      )}
    </div>
  );
};
```

### 7. Adventure Selector Component

```typescript
// src/components/AdventureSelector.tsx
import React, { useState, useEffect } from 'react';
import { AdventureMetadata } from '../types/adventure';
import { loadAdventureList } from '../utils/inkLoader';

interface AdventureSelectorProps {
  onSelectAdventure: (id: string) => void;
}

export const AdventureSelector: React.FC<AdventureSelectorProps> = ({ 
  onSelectAdventure 
}) => {
  const [adventures, setAdventures] = useState<AdventureMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  
  useEffect(() => {
    loadAdventureList().then(list => {
      setAdventures(list);
      setLoading(false);
    });
  }, []);
  
  if (loading) {
    return <div className="loading">Loading adventures...</div>;
  }
  
  return (
    <div className="adventure-selector">
      <h2>Choose Your Adventure</h2>
      <div className="adventure-grid">
        {adventures.map(adventure => (
          <div 
            key={adventure.id}
            className={`adventure-card ${selected === adventure.id ? 'selected' : ''}`}
            onClick={() => setSelected(adventure.id)}
          >
            <img src={adventure.thumbnailUrl} alt={adventure.title} />
            <h3>{adventure.title}</h3>
            <p>{adventure.description}</p>
            <div className="adventure-info">
              <span>Difficulty: {adventure.difficulty}</span>
              <span>Est. Time: {adventure.estimatedPlaytime}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelectAdventure(adventure.id);
              }}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 8. Main App Component

```typescript
// src/App.tsx
import React, { useState } from 'react';
import { Story } from 'inkjs';
import { useInkStory } from './hooks/useInkStory';
import { StoryDisplay } from './components/StoryDisplay';
import { ChoiceButtons } from './components/ChoiceButtons';
import { CombatSystem } from './components/CombatSystem';
import { AdventureSelector } from './components/AdventureSelector';
import { PlayerStats } from './types/adventure';
import './App.css';

const App: React.FC = () => {
  const [storyContent, setStoryContent] = useState<string | null>(null);
  const [showCombat, setShowCombat] = useState(false);
  
  const {
    storyState,
    playerStats,
    continueStory,
    makeChoice,
    setPlayerStats,
  } = useInkStory(storyContent || '');
  
  const handleLoadAdventure = async (id: string) => {
    const response = await fetch(`/adventures/${id}.json`);
    const adventure = await response.json();
    setStoryContent(adventure.storyContent);
  };
  
  const handleCombatEnd = (victory: boolean, rewards?: { exp: number; gold: number }) => {
    if (victory && rewards) {
      setPlayerStats(prev => ({
        ...prev,
        experience: prev.experience + rewards.exp,
        gold: prev.gold + rewards.gold,
      }));
    }
    setShowCombat(false);
    continueStory();
  };
  
  return (
    <div className="App">
      <header>
        <h1>Interactive RPG</h1>
        {playerStats.name && (
          <div className="stats-bar">
            <span>{playerStats.name}</span>
            <span>HP: {playerStats.hp}/{playerStats.maxHp}</span>
            <span>MP: {playerStats.mp}/{playerStats.maxMp}</span>
            <span>Level: {playerStats.level}</span>
          </div>
        )}
      </header>
      
      <main>
        {!storyContent ? (
          <AdventureSelector onSelectAdventure={handleLoadAdventure} />
        ) : showCombat ? (
          <CombatSystem 
            player={playerStats}
            onPlayerUpdate={setPlayerStats}
            onCombatEnd={handleCombatEnd}
          />
        ) : (
          <>
            <StoryDisplay 
              text={storyState.currentText}
              tags={storyState.currentTags}
            />
            <ChoiceButtons 
              choices={storyState.choices}
              onChoice={makeChoice}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
```

### 9. CSS Styling

```css
/* src/App.css */
.App {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Georgia', serif;
  background-color: #1a1a2e;
  color: #e0e0e0;
  min-height: 100vh;
}

header {
  text-align: center;
  border-bottom: 2px solid #4a4a6a;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

header h1 {
  color: #ffd700;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 0.9em;
  color: #a0a0c0;
}

.story-display {
  background-color: #16213e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #4a4a6a;
}

.story-text {
  font-size: 1.1em;
  line-height: 1.6;
  white-space: pre-wrap;
}

.combat-system {
  background-color: #16213e;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #4a4a6a;
}

.combat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.hp-bar {
  width: 200px;
  height: 20px;
  background-color: #333;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.hp-fill {
  height: 100%;
  background-color: #e74c3c;
  transition: width 0.3s ease;
}

.hp-fill.enemy {
  background-color: #9b59b6;
}

.combat-log {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #0f0f23;
  border-radius: 4px;
}

.combat-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  background-color: #4a4a6a;
  color: #e0e0e0;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #6a6a8a;
}

.adventure-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.adventure-card {
  background-color: #16213e;
  border: 2px solid #4a4a6a;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.adventure-card:hover {
  border-color: #ffd700;
  transform: translateY(-5px);
}

.adventure-card.selected {
  border-color: #ffd700;
  background-color: #1a2a5e;
}
```

**Source:** [React with Ink Tutorial](https://wildwinter.medium.com/an-ink-javascript-storylet-testbed-f42ee8915bea)

---

## Integrating inkjs with React

### 1. Optimized Story Manager

Create a singleton story manager for better performance:

```typescript
// src/utils/StoryManager.ts
import { Story, InkList } from 'inkjs';

class StoryManager {
  private story: Story | null = null;
  private callbacks: Map<string, Function[]> = new Map();
  
  loadStory(content: string): void {
    this.story = new Story(content);
    this.setupVariables();
    this.setupObservers();
  }
  
  private setupVariables(): void {
    if (!this.story) return;
    
    const defaultVariables = [
      'player_hp', 'player_mp', 'gold', 'experience',
      'in_combat', 'combat_turn'
    ];
    
    defaultVariables.forEach(name => {
      if (this.story!.variablesState[name] === undefined) {
        this.story!.variablesState[name] = 
          typeof this.story!.variablesState[name] === 'number' ? 0 : null;
      }
    });
  }
  
  private setupObservers(): void {
    if (!this.story) return;
    
    this.story.ObserveVariable('player_hp', (variableName, newValue) => {
      this.notify('player_hp', newValue);
    });
    
    this.story.ObserveVariable('in_combat', (variableName, newValue) => {
      this.notify('in_combat', newValue);
    });
  }
  
  subscribe(event: string, callback: Function): () => void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
    
    return () => {
      const callbacks = this.callbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }
  
  private notify(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
  
  continue(): string {
    if (!this.story || !this.story.canContinue) return '';
    return this.story.Continue();
  }
  
  getChoices(): { text: string; index: number }[] {
    if (!this.story) return [];
    return this.story.currentChoices.map((choice, index) => ({
      text: choice.text,
      index,
    }));
  }
  
  choose(index: number): void {
    if (!this.story) return;
    this.story.ChooseChoiceIndex(index);
  }
  
  getVariable(name: string): any {
    return this.story?.variablesState[name];
  }
  
  setVariable(name: string, value: any): void {
    if (!this.story) return;
    this.story.variablesState[name] = value;
  }
  
  evaluateFunction(name: string, ...args: any[]): any {
    return this.story?.EvaluateFunction(name, args);
  }
  
  reset(): void {
    this.story?.ResetState();
  }
}

export const storyManager = new StoryManager();
```

### 2. Performance Optimization Hooks

```typescript
// src/hooks/useStoryPerformance.ts
import { useMemo, useCallback } from 'react';
import { storyManager } from '../utils/StoryManager';

export const useStoryContent = (storyContent: string) => {
  return useMemo(() => {
    if (storyContent) {
      storyManager.loadStory(storyContent);
    }
  }, [storyContent]);
};

export const useStoryActions = () => {
  const continueStory = useCallback(() => {
    const text = storyManager.continue();
    const choices = storyManager.getChoices();
    return { text, choices };
  }, []);
  
  const chooseChoice = useCallback((index: number) => {
    storyManager.choose(index);
    return continueStory();
  }, [continueStory]);
  
  const getVariable = useCallback((name: string) => {
    return storyManager.getVariable(name);
  }, []);
  
  const setVariable = useCallback((name: string, value: any) => {
    storyManager.setVariable(name, value);
  }, []);
  
  return {
    continueStory,
    chooseChoice,
    getVariable,
    setVariable,
    subscribe: storyManager.subscribe.bind(storyManager),
  };
};
```

### 3. Error Handling

```typescript
// src/utils/errorHandling.ts
export class StoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StoryError';
  }
}

export const handleStoryError = (error: any): StoryError => {
  if (error instanceof StoryError) {
    return error;
  }
  
  const message = error.message || 'Unknown error occurred';
  
  if (message.includes('JSON')) {
    return new StoryError(
      'Failed to parse story file',
      'PARSE_ERROR',
      error
    );
  }
  
  if (message.includes('variable')) {
    return new StoryError(
      'Invalid variable access',
      'VARIABLE_ERROR',
      error
    );
  }
  
  return new StoryError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    error
  );
};

export const retryStory = (maxRetries: number = 3) => {
  let attempts = 0;
  
  return (operation: () => void) => {
    const execute = () => {
      try {
        operation();
      } catch (error) {
        attempts++;
        if (attempts < maxRetries) {
          setTimeout(execute, 1000 * attempts);
        } else {
          throw handleStoryError(error);
        }
      }
    };
    
    execute();
  };
};
```

**Source:** [inkjs Error Handling Examples](https://github.com/y-lohse/inkjs/blob/main/README.md)

---

## Creating an Adventure Loading System

### 1. Adventure Index Structure

```json
// public/adventures/index.json
[
  {
    "id": "dark-forest",
    "title": "The Dark Forest",
    "description": "Venture into the mysterious dark forest and uncover its secrets.",
    "author": "Adventure Master",
    "version": "1.0.0",
    "difficulty": "medium",
    "estimatedPlaytime": "30-60 minutes",
    "thumbnailUrl": "/adventures/thumbnails/forest.png",
    "tags": ["fantasy", "exploration", "combat"]
  },
  {
    "id": "dragon-lair",
    "title": "Dragon's Lair",
    "description": "Challenge the ancient dragon and claim legendary treasures.",
    "author": "Dragon Slayer",
    "version": "1.2.0",
    "difficulty": "hard",
    "estimatedPlaytime": "45-90 minutes",
    "thumbnailUrl": "/adventures/thumbnails/dragon.png",
    "tags": ["fantasy", "boss-battle", "treasure"]
  },
  {
    "id": "mysterious-island",
    "title": "Mysterious Island",
    "description": "Shipwrecked on a strange island, find a way to escape.",
    "author": "Island Explorer",
    "version": "1.0.0",
    "difficulty": "easy",
    "estimatedPlaytime": "20-40 minutes",
    "thumbnailUrl": "/adventures/thumbnails/island.png",
    "tags": ["survival", "puzzle", "exploration"]
  }
]
```

### 2. Adventure File Format

```json
// public/adventures/dark-forest.json
{
  "metadata": {
    "id": "dark-forest",
    "title": "The Dark Forest",
    "version": "1.0.0",
    "engine": "inkjs",
    "compatibility": ["2.0.0", "2.1.0", "2.2.0"]
  },
  "storyContent": "=== start ===\nWelcome to the Dark Forest...\n\n* [Enter the forest] -> enter_forest\n...",
  "configuration": {
    "startingPoint": "start",
    "saveEnabled": true,
    "autoSaveInterval": 30000,
    "combatEnabled": true,
    "inventoryEnabled": true
  },
  "assets": {
    "images": ["/adventures/dark-forest/bg1.png"],
    "sounds": ["/adventures/dark-forest/bgm.mp3"],
    "fonts": []
  }
}
```

### 3. Dynamic Loading Component

```typescript
// src/components/DynamicAdventureLoader.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { loadAdventure, loadAdventureList } from '../utils/inkLoader';
import { AdventureMetadata } from '../types/adventure';
import { storyManager } from '../utils/StoryManager';

interface DynamicLoaderProps {
  adventureId: string | null;
  onLoaded: () => void;
  onError: (error: Error) => void;
}

export const DynamicAdventureLoader: React.FC<DynamicLoaderProps> = ({
  adventureId,
  onLoaded,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!adventureId) return;
    
    const load = async () => {
      setLoading(true);
      setProgress(0);
      
      try {
        // Stage 1: Load metadata
        setProgress(10);
        const adventures = await loadAdventureList();
        const adventure = adventures.find(a => a.id === adventureId);
        
        if (!adventure) {
          throw new Error(`Adventure "${adventureId}" not found`);
        }
        
        // Stage 2: Load story content
        setProgress(30);
        const story = await loadAdventure(adventureId);
        
        if (!story) {
          throw new Error(`Failed to load story for "${adventureId}"`);
        }
        
        // Stage 3: Initialize story
        setProgress(60);
        storyManager.loadStory(story.storyContent);
        
        // Stage 4: Load assets
        setProgress(90);
        await preloadAssets(story);
        
        setProgress(100);
        onLoaded();
      } catch (error) {
        onError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [adventureId]);
  
  const preloadAssets = async (adventure: any): Promise<void> => {
    if (!adventure.assets) return;
    
    const promises = [];
    
    if (adventure.assets.images) {
      adventure.assets.images.forEach((url: string) => {
        promises.push(preloadImage(url));
      });
    }
    
    if (adventure.assets.sounds) {
      adventure.assets.sounds.forEach((url: string) => {
        promises.push(preloadAudio(url));
      });
    }
    
    await Promise.all(promises);
  };
  
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };
  
  const preloadAudio = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      audio.src = url;
    });
  };
  
  if (!loading) return null;
  
  return (
    <div className="adventure-loader">
      <div className="loader-content">
        <h3>Loading Adventure...</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p>{progress}%</p>
      </div>
    </div>
  );
};
```

### 4. Save/Load System

```typescript
// src/utils/saveSystem.ts
import { v4 as uuidv4 } from 'uuid';

export interface SaveData {
  id: string;
  adventureId: string;
  timestamp: number;
  storyState: any;
  playerStats: any;
  inventory: any[];
}

const STORAGE_KEY = 'rpg_adventures_saves';

export const saveGame = (adventureId: string, storyState: any, playerStats: any): string => {
  const saves = getSaves();
  
  const newSave: SaveData = {
    id: uuidv4(),
    adventureId,
    timestamp: Date.now(),
    storyState,
    playerStats,
    inventory: [],
  };
  
  saves.push(newSave);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  
  return newSave.id;
};

export const getSaves = (adventureId?: string): SaveData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  const saves: SaveData[] = JSON.parse(data);
  
  if (adventureId) {
    return saves.filter(save => save.adventureId === adventureId);
  }
  
  return saves;
};

export const loadSave = (saveId: string): SaveData | null => {
  const saves = getSaves();
  return saves.find(save => save.id === saveId) || null;
};

export const deleteSave = (saveId: string): boolean => {
  const saves = getSaves();
  const index = saves.findIndex(save => save.id === saveId);
  
  if (index === -1) return false;
  
  saves.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  
  return true;
};

export const exportSave = (saveId: string): string => {
  const save = loadSave(saveId);
  if (!save) throw new Error('Save not found');
  
  return JSON.stringify(save, null, 2);
};

export const importSave = (jsonString: string): SaveData => {
  const save = JSON.parse(jsonString) as SaveData;
  
  // Validate save structure
  if (!save.id || !save.adventureId || !save.timestamp) {
    throw new Error('Invalid save file');
  }
  
  const saves = getSaves();
  saves.push(save);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  
  return save;
};
```

**Source:** [Save System Examples](https://github.com/inkle/ink/blob/main/Documentation/RunningYourInk.md)

---

## Advanced Combat Mechanics

### 1. Status Effects System

```ink
=== status_effects ===
VAR poisoned = false
VAR poisoned_damage = 3
VAR poisoned_turns = 3
VAR paralyzed = false
VAR paralyzed_turns = 2
VAR slowed = false
VAR burning = false
VAR burning_damage = 4
VAR burning_turns = 2

=== apply_poison ===
~ poisoned = true
~ poisoned_turns = 3
You have been poisoned!

=== apply_paralysis ===
~ paralyzed = true
~ paralyzed_turns = 2
You are paralyzed and cannot move!

=== process_status_effects ===
{poisoned:
    ~ player_hp = player_hp - poisoned_damage
    ~ poisoned_turns = poisoned_turns - 1
    Poison deals {poisoned_damage} damage!
    {poisoned_turns <= 0:
        ~ poisoned = false
        The poison has worn off.
    }
}

{paralyzed:
    {paralyzed_turns > 0:
        ~ paralyzed_turns = paralyzed_turns - 1
        You are still paralyzed!
        -> skip_player_turn
    - else:
        ~ paralyzed = false
        You can move again!
    }
}

{burning:
    ~ player_hp = player_hp - burning_damage
    ~ burning_turns = burning_turns - 1
    Flames burn you for {burning_damage} damage!
    {burning_turns <= 0:
        ~ burning = false
        The flames have died down.
    }
}
```

### 2. Combo System

```ink
=== combo_system ===
VAR combo_count = 0
VAR combo_multiplier = 1.0
VAR max_combo = 5

LIST combo_actions = attack, magic, defend, item
VAR last_action = ""
VAR action_sequence = ()

=== register_action ===
~ current_action = ""
~ combo_count = combo_count + 1

{action_sequence ? current_action:
    ~ combo_count = combo_count + 1
    ~ combo_multiplier = 1 + (combo_count * 0.1)
- else:
    ~ combo_count = 1
    ~ combo_multiplier = 1.0
    ~ action_sequence = ()
}

~ action_sequence += current_action

{combo_count >= max_combo:
    -> execute_combo_finish
}

=== execute_combo_finish ===
COMBO COMPLETE! x{combo_count}
~ damage_bonus = attack_power * combo_multiplier
~ enemy_hp = enemy_hp - damage_bonus

Spectacular combo attack for {damage_bonus} damage!
~ combo_count = 0
~ combo_multiplier = 1.0
~ action_sequence = ()
```

### 3. Boss Battle Mechanics

```ink
=== boss_battle ===
VAR phase = 1
VAR boss_hp = 200
VAR boss_max_hp = 200
VAR special_moves_used = 0
VAR enrage_turn = 10
VAR boss_name = "Dark Knight"

=== boss_turn ===
~ boss_action = RANDOM(1, 100)

{phase == 1:
    {boss_action <= 60:
        -> boss_normal_attack
    - elif boss_action <= 85:
        -> boss_special_ability_1
    - else:
        -> boss_defensive_stance
    }
- elif phase == 2:
    {boss_action <= 40:
        -> boss_normal_attack
    - elif boss_action <= 80:
        -> boss_special_ability_2
    - else:
        -> boss_ultimate_attack
    }
}

=== boss_normal_attack ~
~ damage = 10 + RANDOM(5, 10)
~ player_hp = player_hp - damage
The {boss_name} strikes you for {damage} damage!

=== boss_special_ability_1 ===
~ special_moves_used = special_moves_used + 1
{special_moves_used >= 3:
    -> phase_transition
- else:
    The {boss_name} uses Dark Slash!
    ~ damage = 20 + RANDOM(5, 15)
    ~ player_hp = player_hp - damage
}

=== phase_transition ===
~ phase = 2
~ boss_max_hp = 250
~ boss_hp = boss_max_hp
*** PHASE 2 ***
The {boss_name} becomes more powerful! Attack and speed increased!

=== boss_ultimate_attack ===
~ damage = 40 + RANDOM(10, 20)
~ player_hp = player_hp - damage
The {boss_name} unleashes Ultimate Destruction for {damage} damage!

{player_hp <= 0:
    -> player_defeat
}
```

**Source:** [Ink Complex Combat Examples](https://github.com/inkle/ink/tree/main/Documentation)

---

## Best Practices and Optimization

### 1. Performance Tips

**Optimization Guidelines:**

```typescript
// 1. Memoize expensive computations
const expensiveComputation = useMemo(() => {
  return calculateComplexStats(playerStats);
}, [playerStats]);

// 2. Use ref for frequently changing values
const combatRef = useRef(combatState);

// 3. Debounce user input
const debouncedSearch = useMemo(
  () => debounce(searchAdventures, 300),
  []
);

// 4. Lazy load adventures
const AdventureComponent = React.lazy(() => 
  import('./components/AdventureView')
);

// 5. Use React.memo for components
export const StatsDisplay = React.memo<StatsDisplayProps>(({ stats }) => {
  return <div>{/* render stats */}</div>;
});
```

### 2. Memory Management

```typescript
// Proper cleanup for inkjs story
useEffect(() => {
  const story = new Story(content);
  
  return () => {
    story.ResetState();
    story = null;
  };
}, [content]);
```

### 3. Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };
  
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Story Error:', error, errorInfo);
  }
  
  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 4. Testing Strategies

```typescript
// src/tests/combatLogic.test.ts
import { calculateDamage, createEnemy } from '../utils/combatLogic';

describe('Combat Logic', () => {
  test('should calculate damage correctly', () => {
    const attacker = { attack: 15 };
    const defender = { defense: 5 };
    const result = calculateDamage(attacker, defender, { type: 'attack' });
    
    expect(result.damage).toBeGreaterThan(0);
    expect(result.damage).toBeLessThanOrEqual(20);
  });
  
  test('should create enemy with correct stats', () => {
    const enemy = createEnemy('goblin', 1);
    
    expect(enemy.name).toBe('Goblin');
    expect(enemy.hp).toBeGreaterThan(0);
    expect(enemy.damage).toBeGreaterThan(0);
  });
  
  test('should handle critical hits', () => {
    let criticalHits = 0;
    
    for (let i = 0; i < 100; i++) {
      const attacker = { attack: 10 };
      const defender = { defense: 5 };
      const result = calculateDamage(attacker, defender, { type: 'attack' });
      
      if (result.isCritical) criticalHits++;
    }
    
    expect(criticalHits).toBeGreaterThan(0);
    expect(criticalHits).toBeLessThan(30);
  });
});
```

### 5. Accessibility

```typescript
// Add keyboard navigation and ARIA labels
export const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ choices, onChoice }) => {
  return (
    <div 
      className="choice-buttons" 
      role="listbox" 
      aria-label="Story choices"
    >
      {choices.map((choice, index) => (
        <button
          key={index}
          role="option"
          aria-selected={false}
          onClick={() => onChoice(index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChoice(index);
            }
          }}
          tabIndex={0}
        >
          {choice}
        </button>
      ))}
    </div>
  );
};
```

**Source:** [Ink Performance Guidelines](https://github.com/y-lohse/inkjs/blob/main/README.md)

---

## Additional Resources

### Official Documentation

1. **Inkle's Ink Documentation**
   - [Ink Language Reference](https://github.com/inkle/ink/tree/main/Documentation)
   - [Ink Tutorial](https://www.inklestudios.com/ink/web-tutorial/)
   - [Ink Examples](https://github.com/inkle/ink/tree/main/Documentation/Examples)

2. **inkjs Documentation**
   - [inkjs GitHub Repository](https://github.com/y-lohse/inkjs)
   - [inkjs NPM Package](https://www.npmjs.com/package/inkjs)
   - [inkjs Documentation](https://github.com/y-lohse/inkjs/tree/main/docs)

### Tutorials and Guides

3. **Interactive Fiction Tutorials**
   - [JavaScript + Ink: Part 2: Story API](https://videlais.com/2019/05/27/javascript-ink-part-2-story-api/)
   - [An Ink/JavaScript Storylet Testbed](https://wildwinter.medium.com/an-ink-javascript-storylet-testbed-f42ee8915bea)
   - [InkGameScript Getting Started Guide](https://inkgamescript.online/blog/getting-started-with-inkgamescript.html)

4. **React Integration Tutorials**
   - [React + Ink CLI Tutorial](https://www.freecodecamp.org/news/react-js-ink-cli-tutorial/)
   - [Using Ink UI with React](https://blog.logrocket.com/using-ink-ui-react-build-interactive-custom-clis/)
   - [Creating Terminal Apps with Ink + React](https://medium.com/@pixelreverb/creating-a-terminal-application-with-ink-react-typescript-an-introduction-da49f3c012a8)

### Example Projects

5. **Open Source Projects**
   - [inkjs Boilerplate](https://code.oreolek.me/oreolek/inkjs-boilerplate)
   - [text-rpg-engine](https://github.com/jddunn/text-rpg-engine)
   - [jsrpg-react (ASCII RPG)](https://github.com/davidfioravanti/jsrpg-react)

6. **Game Examples with Ink**
   - [80 Days](https://inklestudios.com/80days/) - Commercial example
   - [Bury Me My Love](https://www.inklestudios.com/bury-me-my-love/) - IGF nominee
   - [Where the Water Tastes Like Wine](http://www.wherethewatertasteslikewine.com/) - IGF nominee

### Tools and Editors

7. **Development Tools**
   - [Inky Editor](https://github.com/inkle/ink/releases)
   - [VS Code with Ink Syntax Highlighting](https://marketplace.visualstudio.com/items?itemName=ThiefMaster.ink)
   - [Ink Web Compiler](https://github.com/inkle/ink/tree/main/compiler)

8. **Testing Tools**
   - [ink-interactive-tutorial](https://github.com/furkleindustries/ink-interactive-tutorial)

### Community Resources

9. **Forums and Communities**
   - [Inkle Studios Forum](https://forum.inklestudios.com/)
   - [r/interactivefiction - Reddit](https://www.reddit.com/r/interactivefiction/)
   - [GitHub Discussions - inkjs](https://github.com/y-lohse/inkjs/discussions)

10. **YouTube Tutorials**
    - [Learn Ink in 15 Minutes](https://www.youtube.com/watch?v=KSRpcftVyKg)
    - [Ink + Unity Integration](https://www.youtube.com/watch?v=4QKq3G5_KwA)

### Related Libraries

11. **Complementary Libraries**
    - [React Router](https://reactrouter.com/)
    - [Zustand (State Management)](https://github.com/pmndrs/zustand)
    - [React Query (Data Fetching)](https://tanstack.com/query/latest)
    - [uuid](https://www.npmjs.com/package/uuid)

---

## Quick Reference

### Ink Language Cheat Sheet

```ink
// Comments
// This is a comment

// Variables
VAR name = "Hero"
VAR hp = 100
LIST skills = Fire, Ice, Thunder

// Knots (story sections)
=== chapter_one ===
Content here...

// Choices
* Choice text -> destination_knot

// Conditional text
{condition: true text | false text}

// Loops
{visited > 3: You've been here many times. | First time?}

// Functions
=== function heal(amount) ===
~ hp = hp + amount

// Random numbers
~ roll = RANDOM(1, 20)

// Lists
~ inventory += "Sword"
~ inventory -= "Shield"
```

### React Component Structure

```typescript
// Standard component pattern
import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  // Define props
}

export const ComponentName: React.FC<Props> = (props) => {
  // Hooks
  const [state, setState] = useState(initialState);
  
  // Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  // Callbacks
  const handler = useCallback(() => {
    // logic
  }, [dependencies]);
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Deployment Checklist

- [ ] Test all combat scenarios
- [ ] Verify save/load functionality
- [ ] Check mobile responsiveness
- [ ] Add accessibility features
- [ ] Optimize large story files
- [ ] Set up error boundaries
- [ ] Configure proper caching headers
- [ ] Test on multiple browsers
- [ ] Document adventure creation guide
- [ ] Set up CI/CD pipeline

---

## Conclusion

This comprehensive guide has covered all aspects of building a text-based RPG with inkjs and React. Key takeaways:

1. **Ink Language** provides a powerful yet simple way to create branching narratives
2. **inkjs** enables web-based interactive fiction with zero dependencies
3. **React** offers a flexible UI framework for building responsive game interfaces
4. **Combat Systems** can be implemented using Ink's conditional logic and functions
5. **Adventure Loading** allows for modular, swappable content

**Next Steps:**
- Start with simple adventures to understand the workflow
- Gradually add combat mechanics and complex state management
- Build a community around your platform for user-generated content

**Happy developing your text-based RPG!**