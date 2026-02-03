# Calligrapher

A **CLI tool** for running interactive fiction files from the command line.

```
╔══════════════════════════════════════════════════════════════╗
║                    Calligrapher - Ink Runner                 ║
║                 Interactive Fiction CLI Tool                  ║
╚══════════════════════════════════════════════════════════════╝
```

## Features

- **Run .txt/.md files** - Simple text-based adventures (works immediately)
- **Run .ink files** - Full Ink stories (auto-compiles with bundled inklecate)
- **Run .json stories** - Pre-compiled Ink stories
- **Watch mode** - Auto-recompile when files change
- **Save/Restore** - Save game state and resume later
- **Beautiful TUI** - Colored output with interactive menus
- **Version compatible** - Works with inkjs v2.3.2

## Quick Start

```bash
# Install (downloads inklecate automatically)
cd calligrapher
npm install
npm run build

# Run a text adventure
./bin/calligrapher.js simple.txt

# Run an Ink story (auto-compiles)
./bin/calligrapher.js test-story.ink

# Compile only
./bin/calligrapher.js compile story.ink

# Watch mode
./bin/calligrapher.js watch story.ink

# Help
./bin/calligrapher.js --help
```

## Installation

```bash
# Clone
git clone <your-repo>
cd calligrapher

# Install & setup (downloads inklecate)
npm install

# Build TypeScript
npm run build
```

# Install globally (optional)
npm link
```

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `calligrapher story.txt` | Run text adventure |
| `calligrapher story.ink` | Run Ink file (auto-compiles) |
| `calligrapher compile story.ink` | Compile to JSON only |
| `calligrapher watch story.ink` | Watch and recompile |
| `calligrapher replay save.json` | Restore saved game |
| `calligrapher --help` | Show help |

### Options

| Option | Description |
|--------|-------------|
| `-V, --version` | Show version |
| `-h, --help` | Show help |
| `-v, --verbose` | Increase verbosity (use multiple times) |
| `-s, --silent` | Suppress output |
| `-o, --output <file>` | Set output file (compile mode) |
| `-w, --watch` | Enable watch mode |
| `--no-save` | Disable auto-save |
| `--seed <number>` | Set random seed |

### Examples

```bash
# Text adventure (works immediately)
./bin/calligrapher.js simple.txt

# Ink story (auto-compiles)
./bin/calligrapher.js test-story.ink

# Compile Ink to JSON
./bin/calligrapher.js compile story.ink -o output.json

# Watch mode with verbose output
./bin/calligrapher.js watch story.ink -vv
```

## Supported Formats

| Format | Description | Works Out of Box |
|--------|-------------|------------------|
| `.txt` | Text adventures | ✅ Yes |
| `.md` | Markdown stories | ✅ Yes |
| `.ink` | Ink source files | ⚠️ Requires `npm install` |
| `.json` | Compiled Ink stories | ✅ Yes |

## Ink (.ink) Files

After running `npm install`, the inklecate compiler is automatically downloaded:
- **inkjs v2.3.2** included
- **inklecate v1.2.0** (runs postinstall)
- **Auto-compilation** when running `.ink` files

If the download fails, run manually:
```bash
npm run setup
``` |

## Ink (.ink) Files

Calligrapher includes a **bundled inklecate** compiler that works with inkjs v2.3.2:

- **inkjs v2.3.2** included
- **inklecate v1.2.0** bundled (outputs ink v21)
- **Auto-compilation** when running `.ink` files
- **No version mismatch warnings**

### Version Compatibility

The bundled inklecate is automatically detected first:
1. `./bin/inklecate` (bundled, preferred)
2. `/usr/local/bin/inklecate`
3. `/usr/bin/inklecate`
4. `~/.local/bin/inklecate`
5. `~/.nvm/.../bin/inklecate` (last resort)

## Text Story Format (.txt)

Create simple adventures in text format:

```txt
=== start ===
You stand at a crossroads in an ancient forest.

* [Go left toward the dark woods] -> dark_woods
* [Go right toward the shining castle] -> castle
* [Wait and think] -> think

=== dark_woods ===
The trees are thick and block most of the light.
You hear strange sounds in the distance...

* [Investigate the sound] -> investigate
* [Run back to the crossroads] -> start

=== castle ===
A magnificent castle rises before you.

✨ VICTORY! You found safety! ✨

* [Play again] -> start
```

## Project Structure

```
calligrapher/
├── bin/
│   ├── calligrapher.js      # CLI entry point
│   └── inklecate            # Bundled Ink compiler
├── src/
│   ├── index.ts             # Main entry point
│   ├── args.ts              # Argument parsing
│   ├── cli.ts               # TUI implementation
│   └── compiler.ts          # Ink compilation
├── simple.txt               # Sample text adventure
├── test-story.ink          # Test story
├── test-story.json         # Compiled test story
├── package.json
└── README.md
```

## Dependencies

- **inkjs** - Ink runtime engine (v2.3.2)
- **chalk** - Terminal styling
- **enquirer** - Interactive prompts
- **boxen** - Terminal boxes

## Troubleshooting

### "inklecate compiler not found"

Run the setup script:
```bash
npm run setup
```

### Download script fails with GitHub API error

Wait a few minutes and retry, or download manually:
```bash
# Download from https://github.com/inkle/ink/releases/latest
# Extract inklecate to bin/
```

### "Story Complete" appears immediately

Rebuild the project:
```bash
npm run clean && npm run build
```

### Interactive mode not working

Ensure your terminal supports ANSI escape codes and arrow key navigation.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run setup` | Download inklecate |
| `npm run build` | Compile TypeScript |
| `npm run clean` | Clean build artifacts |
| `npm run dev` | Run in dev mode |

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Re-download inklecate
npm run setup

# Clean build files
npm run clean

# Run in development mode
npm run dev
```

## Project Structure

```
calligrapher/
├── bin/
│   ├── calligrapher.js      # CLI entry point
│   └── inklecate            # Ink compiler (downloaded by scripts/)
├── scripts/
│   └── download-inklecate.js  # Setup script
├── src/
│   ├── index.ts             # Main entry point
│   ├── args.ts              # Argument parsing
│   ├── cli.ts               # TUI implementation
│   └── compiler.ts          # Ink compilation
├── simple.txt               # Sample text adventure
├── test-story.ink          # Test story
├── test-story.json          # Compiled test story (auto-generated)
├── package.json
└── README.md
```

## License

MIT

## See Also

- [Ink Scripting Language](https://github.com/inkle/ink)
- [inkjs Runtime](https://github.com/y-lohse/inkjs)
- [Inky Editor](https://github.com/inkle/inky)

---

Happy storytelling! ✍️