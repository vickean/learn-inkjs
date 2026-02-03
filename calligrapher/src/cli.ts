import * as fs from 'fs';
import * as path from 'path';
import { Story } from 'inkjs';
import enquirer from 'enquirer';
import chalk from 'chalk';
import figures from 'figures';
import boxen from 'boxen';
import { compileInk, findInklecate, inkToJson } from './compiler';

interface CLIOptions {
  verbose: number;
  silent: boolean;
}

interface StoryState {
  currentText: string;
  choices: string[];
  canContinue: boolean;
  tags: string[];
}

export class CalligrapherCLI {
  private story: Story | null = null;
  private storyContent: string = '';
  private currentState: StoryState = {
    currentText: '',
    choices: [],
    canContinue: false,
    tags: [],
  };
  private options: CLIOptions;
  private saveFile?: string;

  constructor(options: CLIOptions = { verbose: 0, silent: false }) {
    this.options = options;
  }

  async runFile(filePath: string, _opts?: unknown): Promise<void> {
    try {
      this.printHeader('Calligrapher');

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const ext = path.extname(filePath).toLowerCase();

      if (ext === '.ink') {
        await this.runInkStory(filePath);
      } else if (ext === '.json') {
        await this.runJsonStory(filePath);
      } else if (ext === '.txt' || ext === '.md') {
        await this.runTextStory(filePath);
      } else {
        console.log(chalk.yellow(`\n📝 Unsupported file format: ${ext}\n`));
        console.log('Supported formats:');
        console.log('  - .ink  Ink source files (requires inklecate)');
        console.log('  - .json Compiled Ink stories');
        console.log('  - .txt  Simple text adventures');
      }

    } catch (error) {
      console.error(chalk.red(`\n✖ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  }

  private async runInkStory(filePath: string): Promise<void> {
    if (this.options.verbose > 0) {
      console.log(chalk.cyan(`\n📦 Compiling: ${filePath}\n`));
    }

    const inklecatePath = findInklecate();
    if (!inklecatePath) {
      console.log(chalk.yellow('\n⚠️  inklecate compiler not found!\n'));
      console.log('Please install inklecate from:');
      console.log('  https://github.com/inkle/ink/releases\n');
      console.log('For now, using basic text story mode...\n');
      await this.runTextStory(filePath);
      return;
    }

    const jsonPath = filePath.replace(/\.ink$/, '.json');

    try {
      const result = compileInk({ inputPath: filePath, outputPath: jsonPath, verbose: this.options.verbose > 0 });
      if (!result.success) {
        throw new Error(result.error);
      }

      await this.runJsonStory(jsonPath);
    } catch (error) {
      console.error(chalk.red(`\n✖ Compilation failed: ${(error as Error).message}`));
      console.log(chalk.gray('\nFalling back to text mode...'));
      await this.runTextStory(filePath);
    }
  }

  private async runJsonStory(filePath: string): Promise<void> {
    try {
      let jsonContent = fs.readFileSync(filePath, 'utf-8');
      if (jsonContent.charCodeAt(0) === 0xFEFF) {
        jsonContent = jsonContent.slice(1);
      }
      this.story = new Story(jsonContent);

      this.printHeader('Playing: ' + path.basename(filePath));

      await this.runStoryLoop();

      this.printFooter();

    } catch (error) {
      throw new Error(`Failed to load story: ${(error as Error).message}`);
    }
  }

  private async runTextStory(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const story: Record<string, string[]> = {};
    let currentSection = '';
    let allSections: string[] = [];

    for (const line of lines) {
      if (line.startsWith('===')) {
        currentSection = line.replace(/===/g, '').trim();
        story[currentSection] = [];
        if (!allSections.includes(currentSection)) {
          allSections.push(currentSection);
        }
      } else if (currentSection && line.trim()) {
        story[currentSection].push(line);
      }
    }

    console.log(chalk.cyanBright(`\n📖 Loaded: ${filePath}\n`));

    let current = 'start';
    let playAgain = true;

    while (playAgain) {
      if (!story[current]) {
        console.log(chalk.red(`\n✖ Section "${current}" not found!\n`));
        break;
      }

      const lines = story[current];
      const choiceLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('*') || line.toLowerCase().includes('[exit]')) {
          choiceLines.push(line);
        } else {
          console.log(chalk.white(line));
        }
      }

      const choices: string[] = [];
      const targets: Record<string, string> = {};

      for (const choice of choiceLines) {
        const textMatch = choice.match(/^\*?\s*(.+?)\s*->\s*(\S+)/);
        if (textMatch) {
          const choiceText = textMatch[1].replace(/^\*\s*/, '').replace(/[\[\]]/g, '').trim();
          const target = textMatch[2];
          choices.push(choiceText);
          targets[choiceText] = target;
        }
      }

      if (choices.length > 0) {
        choices.push('Quit');

        const { selection } = await enquirer.prompt<{ selection: number }>({
          type: 'select',
          name: 'selection',
          message: chalk.cyan('What do you do?'),
          choices: choices,
        });

        const selected = choices[selection];

        if (selected === 'Quit') {
          playAgain = false;
          break;
        }

        current = targets[selected] || current;
      } else {
        console.log(chalk.gray('\n[End of this section]\n'));
        playAgain = false;
      }
    }

    this.printFooter();
  }

  private async runStoryLoop(): Promise<void> {
    if (!this.story) return;

    while (true) {
      this.advanceStory();

      if (this.currentState.canContinue || this.currentState.choices.length > 0) {
        await this.displayAndChoose();
      } else {
        break;
      }
    }
  }

  private advanceStory(): void {
    if (!this.story) return;

    let text = '';
    if (this.story.canContinue) {
      text = this.story.Continue() || '';
    }

    const choices: string[] = [];
    this.story.currentChoices.forEach((choice: { text: string }) => {
      choices.push(choice.text);
    });

    const tags = this.story.currentTags || [];

    this.currentState = {
      currentText: text,
      choices,
      canContinue: this.story.canContinue || this.story.currentChoices.length > 0,
      tags,
    };

    this.displayText(text, tags);
  }

  private displayText(text: string, tags: string[]): void {
    if (!text.trim()) return;

    if (tags.includes('title')) {
      console.log(chalk.cyanBright.underline(`\n${text}\n`));
    } else if (tags.includes('scene')) {
      console.log(chalk.yellow(`\n━━━ ${text} ━━━\n`));
    } else if (tags.includes('combat')) {
      console.log(chalk.red(`\n${figures.cross} ${text}\n`));
    } else if (tags.includes('dialog')) {
      console.log(chalk.cyan(`  "${text}"`));
    } else {
      console.log(chalk.white(text));
    }
  }

  private async displayAndChoose(): Promise<void> {
    if (this.currentState.choices.length > 0) {
      const choices = this.currentState.choices.map((choice, index) => ({
        name: `${index + 1}. ${choice}`,
        value: index,
      }));

      choices.push({ name: '0. Quit', value: -1 });
      choices.push({ name: 'S. Save game', value: -2 });

      const { choice } = await enquirer.prompt<{ choice: string }>({
        type: 'select',
        name: 'choice',
        message: chalk.cyan('What do you do?'),
        choices: choices.map(c => c.name),
        stdout: process.stdout,
      });

      const selectedChoice = choices.find(c => c.name === choice);
      const selectedIndex = selectedChoice?.value;

      if (selectedIndex === -1) {
        console.log(chalk.gray('\nThanks for playing!\n'));
        process.exit(0);
      } else if (selectedIndex === -2) {
        await this.saveGame();
      } else if (this.story && selectedIndex !== undefined) {
        this.story.ChooseChoiceIndex(selectedIndex);
      }
    } else if (this.currentState.canContinue) {
      await this.pressToContinue();
    }
  }

  private async pressToContinue(): Promise<void> {
    const { cont } = await enquirer.prompt<{ cont: boolean }>({
      type: 'confirm',
      name: 'cont',
      message: chalk.gray('Press Enter to continue... (or Q to quit)'),
      initial: true,
    });

    if (!cont) {
      console.log(chalk.gray('\nThanks for playing!\n'));
      process.exit(0);
    }
  }

  async compile(filePath: string, _opts?: unknown): Promise<void> {
    console.log(chalk.cyanBright(`\n📄 Compiling: ${filePath}\n`));

    try {
      const jsonPath = inkToJson(filePath);
      console.log(chalk.green(`✓ Compiled: ${jsonPath}\n`));
    } catch (error) {
      console.error(chalk.red(`\n✖ Compilation failed: ${(error as Error).message}\n`));
      process.exit(1);
    }
  }

  async watch(filePath: string, _opts?: unknown): Promise<void> {
    console.log(chalk.cyanBright(`\n👀 Watching: ${filePath}\n`));
    console.log('Press Ctrl+C to stop watching.\n');

    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`\n✖ File not found: ${filePath}\n`));
      process.exit(1);
    }

    let md5Previous = this.calculateMd5(filePath);

    console.log(chalk.gray(`Initial MD5: ${md5Previous}`));
    console.log(chalk.gray('Waiting for changes...\n'));

    const fsWait = setInterval(() => {
      const md5Current = this.calculateMd5(filePath);

      if (md5Current !== md5Previous) {
        md5Previous = md5Current;
        console.log(chalk.cyan(`\n=== File changed, recompiling ===\n`));

        try {
          const jsonPath = inkToJson(filePath);
          console.log(chalk.green(`✓ Compiled: ${jsonPath}\n`));
          console.log(chalk.gray('Waiting for changes...\n'));
        } catch (error) {
          console.error(chalk.red(`\n✖ Compilation failed: ${(error as Error).message}\n`));
          console.log(chalk.gray('Waiting for changes...\n'));
        }
      }
    }, 1000);

    process.on('SIGINT', () => {
      clearInterval(fsWait);
      console.log(chalk.gray('\n\nStopping watch...\n'));
      process.exit(0);
    });
  }

  async replay(filePath: string): Promise<void> {
    console.log(chalk.cyanBright(`\n🔄 Restoring: ${filePath}\n`));

    try {
      const saveContent = fs.readFileSync(filePath, 'utf-8');
      const saveData = JSON.parse(saveContent);

      this.story = new Story(saveData.storyJson);
      this.story.state.LoadJson(saveData.state);

      console.log(chalk.green(`✓ Game restored!\n`));

      await this.runStoryLoop();
      this.printFooter();

    } catch (error) {
      console.error(chalk.red(`\n✖ Failed to restore game: ${(error as Error).message}\n`));
      process.exit(1);
    }
  }

  private async saveGame(): Promise<void> {
    if (!this.story) return;

    const saveData = {
      storyJson: this.story.ToJson(),
      state: this.story.state.ToJson(),
      savedAt: new Date().toISOString(),
      version: '1.0',
    };

    const defaultPath = 'calligrapher-save.json';

    const { savePath } = await enquirer.prompt<{ savePath: string }>({
      type: 'input',
      name: 'savePath',
      message: chalk.cyan('Save file path:'),
      initial: defaultPath,
    });

    try {
      fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));
      console.log(chalk.green(`\n✓ Game saved to: ${savePath}\n`));
    } catch (error) {
      console.error(chalk.red(`\n✖ Failed to save game: ${(error as Error).message}\n`));
    }
  }

  private calculateMd5(filePath: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
  }

  private printHeader(title?: string): void {
    const headerTitle = title ? ` ${title} ` : ' Adventure Started ';
    console.log(boxen(headerTitle, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderColor: 'green',
      borderStyle: 'round',
    }));
    console.log(chalk.gray(' Use arrow keys to navigate, Enter to select, S to save\n'));
  }

  private printFooter(): void {
    console.log(boxen(' 🏁 Story Complete 🏁 ', {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderColor: 'yellow',
      borderStyle: 'round',
    }));
    console.log(chalk.gray('\nThank you for using Calligrapher!\n'));
  }
}