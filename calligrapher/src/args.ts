interface GlobalOptions {
  verbose: number;
  silent: boolean;
  color: boolean;
}

interface RunOptions extends GlobalOptions {
  output?: string;
  seed?: number;
  saveFile?: string;
  noSave: boolean;
}

interface CompileOptions extends GlobalOptions {
  output?: string;
  watch: boolean;
  json: boolean;
}

interface CommonOptions extends GlobalOptions {
  help: boolean;
  version: boolean;
}

type CommandType = 'run' | 'compile' | 'watch' | 'replay' | null;

interface ParsedArgs {
  command: CommandType;
  file?: string;
  options: RunOptions | CompileOptions | CommonOptions;
  remaining: string[];
}

export function parseArgs(): ParsedArgs {
  const argv = process.argv.slice(2);
  let command: CommandType = null;
  let file: string | undefined;
  const options: Partial<RunOptions & CompileOptions & CommonOptions> = {
    verbose: 0,
    silent: false,
    color: true,
    noSave: false,
    watch: false,
    json: true,
  };
  const remaining: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      (options as CommonOptions).help = true;
      break;
    }

    if (arg === '--version' || arg === '-V') {
      (options as CommonOptions).version = true;
      break;
    }

    if (arg === '--verbose' || arg === '-v') {
      options.verbose = (options.verbose || 0) + 1;
      continue;
    }

    if (arg === '--silent' || arg === '-s') {
      options.silent = true;
      continue;
    }

    if (arg === '--no-color') {
      options.color = false;
      continue;
    }

    if (arg === '--no-save') {
      options.noSave = true;
      continue;
    }

    if (arg === '--seed') {
      options.seed = parseInt(argv[++i], 10);
      continue;
    }

    if (arg === '--output' || arg === '-o') {
      options.output = argv[++i];
      continue;
    }

    if (arg === '--watch' || arg === '-w') {
      options.watch = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--save' || arg === '-S') {
      options.saveFile = argv[++i];
      continue;
    }

    if (arg.startsWith('-')) {
      continue;
    }

    if (!command && ['run', 'compile', 'watch', 'replay'].includes(arg)) {
      command = arg as CommandType;
      continue;
    }

    if (!file && (arg.endsWith('.ink') || arg.endsWith('.json') || arg.endsWith('.txt') || arg.endsWith('.md'))) {
      file = arg;
      continue;
    }

    remaining.push(arg);
  }

  return { command, file, options: options as RunOptions | CompileOptions | CommonOptions, remaining };
}