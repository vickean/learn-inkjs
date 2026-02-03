#!/usr/bin/env node

import { parseArgs } from './args';
import { CalligrapherCLI } from './cli';

const main = async () => {
  const args = parseArgs();
  const opts = args.options;

  if ('version' in opts && opts.version) {
    console.log('Calligrapher v1.0.0');
    console.log('Ink Interactive Fiction Runner');
    console.log('https://github.com/inkle/ink');
    process.exit(0);
  }

  if ('help' in opts && opts.help) {
    printHelp();
    process.exit(0);
  }

  const cli = new CalligrapherCLI({ verbose: opts.verbose || 0, silent: opts.silent });

  if (args.command === 'compile' && args.file?.endsWith('.ink')) {
    await cli.compile(args.file!, opts);
  } else if (args.command === 'watch') {
    await cli.watch(args.file!, opts);
  } else if (args.command === 'replay') {
    await cli.replay(args.file!);
  } else if (args.file) {
    await cli.runFile(args.file, opts);
  } else {
    printHelp();
    process.exit(1);
  }
};

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    Calligrapher - Ink Runner                         ║
║                 Interactive Fiction CLI Tool                        ║
╚══════════════════════════════════════════════════════════════════════╝

Usage: calligrapher [command] <file> [options]

Commands:
  run <file.ink>      Run an Ink story file
  compile <file.ink>  Compile .ink to .json only
  watch <file.ink>    Watch for changes and recompile
  replay <file.save>  Restore a saved game state

Options:
  -V, --version       Show version
  -h, --help          Show this help
  -v, --verbose       Increase verbosity (use -vv or -vvv for more)
  -s, --silent        Suppress non-essential output
  -o, --output <file> Set output file (for compile)
  -w, --watch         Enable watch mode
  --no-save           Disable auto-save
  --seed <number>     Set random seed for reproducible runs

Examples:
  calligrapher story.ink                    Run story directly
  calligrapher run story.ink               Explicit run command
  calligrapher compile story.ink           Compile to JSON
  calligrapher watch story.ink -vv          Watch with verbose output
  calligrapher story.ink -o output.json     Custom output file

Supported formats:
  *.ink   - Ink source files (requires inklecate)
  *.json  - Compiled Ink stories
  *.txt   - Simple text adventures

For .ink files, Calligrapher will automatically compile using inklecate.
Download inklecate from: https://github.com/inkle/ink/releases

For more information, visit: https://github.com/inkle/ink
`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});