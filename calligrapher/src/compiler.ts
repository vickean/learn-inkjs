import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export interface CompilerResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  inklecatePath?: string;
}

export interface CompileOptions {
  inputPath: string;
  outputPath?: string;
  verbose?: boolean;
  noThrow?: boolean;
}

export function findInklecate(): string | null {
  const platform = os.platform();
  const arch = os.arch();

  const possiblePaths = [
    path.join(__dirname, '..', '..', 'bin', 'inklecate'),
    path.join(__dirname, '..', '..', 'bin', platform === 'win32' ? 'inklecate_win.exe' : 'inklecate'),
    path.join(process.cwd(), 'bin', 'inklecate'),
    path.join(process.cwd(), 'bin', platform === 'win32' ? 'inklecate_win.exe' : 'inklecate'),
    path.join(__dirname, '..', 'bin', 'inklecate'),
    '/usr/local/bin/inklecate',
    '/usr/bin/inklecate',
    path.join(os.homedir(), '.local', 'bin', 'inklecate'),
    path.join(os.homedir(), 'bin', 'inklecate'),
    path.join(os.homedir(), '.nvm', 'versions', 'node', 'v22.15.0', 'lib', 'node_modules', '@6i', 'ink-tools', 'bin', 'inklecate', 'inklecate_win.exe'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      if (platform !== 'win32' && !p.endsWith('.exe')) {
        try {
          fs.chmodSync(p, '755');
        } catch {}
      }
      return p;
    }
  }

  if (platform === 'linux') {
    const linuxPaths = [
      '/usr/bin/inklecate',
      '/usr/local/bin/inklecate',
    ];
    for (const p of linuxPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }

  return null;
}

export function getInklecateDownloadUrl(): string {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === 'linux' && arch === 'x64') {
    return 'https://github.com/inkle/ink/releases/latest/download/inklecate-linux-x86_64.zip';
  } else if (platform === 'darwin') {
    return 'https://github.com/inkle/ink/releases/latest/download/inklecate-macos.zip';
  } else if (platform === 'win32') {
    return 'https://github.com/inkle/ink/releases/latest/download/inklecate-windows.zip';
  }

  return 'https://github.com/inkle/ink/releases';
}

export function getInklecateInstallationInstructions(): string {
  return `
Install inklecate using one of these methods:

1. Download from GitHub:
   https://github.com/inkle/ink/releases

2. Using npm (ink-to-json package):
   npm install -g @6i/ink-tools

3. Using Homebrew (macOS):
   brew install inklecate

4. Build from source:
   git clone https://github.com/inkle/ink.git
   cd ink
   ./configure
   make

After installation, ensure 'inklecate' is in your PATH.

For Calligrapher, you can also place inklecate in:
  - ./bin/inklecate/ (project local)
  - /usr/local/bin/ (system wide)
  - ~/.local/bin/ (user local)
`;
}

export function compileInk(options: CompileOptions): CompilerResult {
  const { inputPath, outputPath, verbose, noThrow } = options;

  if (!fs.existsSync(inputPath)) {
    return { success: false, error: `Input file not found: ${inputPath}` };
  }

  const ext = path.extname(inputPath).toLowerCase();
  if (ext !== '.ink') {
    return { success: false, error: `Expected .ink file, got: ${ext}` };
  }

  const inklecatePath = findInklecate();
  if (!inklecatePath) {
    return {
      success: false,
      error: 'inklecate compiler not found.',
      inklecatePath: ''
    };
  }

  const defaultOutput = inputPath.replace(/\.ink$/, '.json');
  const finalOutput = outputPath || defaultOutput;

  try {
    let cmd: string;
    const monoPath = '/usr/bin/mono';

    if (inklecatePath?.endsWith('.exe')) {
      cmd = `${monoPath} "${inklecatePath}" -o "${finalOutput}" "${inputPath}"`;
    } else {
      cmd = `"${inklecatePath}" -o "${finalOutput}" "${inputPath}"`;
    }

    if (verbose) {
      console.log(`Compiling: ${inputPath}`);
      console.log(`Output: ${finalOutput}`);
      console.log(`Compiler: ${inklecatePath}`);
    }

    execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] });

    let content = fs.readFileSync(finalOutput, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
      fs.writeFileSync(finalOutput, content, 'utf-8');
    }

    if (verbose) {
      console.log('Compilation successful!');
    }

    return { success: true, outputPath: finalOutput };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Compilation failed: ${errorMessage}` };
  }
}

export function inkToJson(inputPath: string, outputPath?: string): string {
  const result = compileInk({ inputPath, outputPath });
  if (!result.success) {
    if (result.error?.includes('inklecate compiler not found')) {
      console.error('\n' + result.error);
      console.error(getInklecateInstallationInstructions());
    }
    throw new Error(result.error);
  }
  return result.outputPath!;
}

export function compileWithInkToJson(inputPath: string, outputPath?: string): string {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const defaultOutput = inputPath.replace(/\.ink$/, '.json');
  const finalOutput = outputPath || defaultOutput;

  const monoPath = '/usr/bin/mono';
  const inklecatePath = findInklecate();

  let cmd: string;
  if (inklecatePath?.endsWith('.exe')) {
    cmd = `${monoPath} "${inklecatePath}" -o "${finalOutput}" "${inputPath}"`;
  } else {
    cmd = `"${inklecatePath}" -o "${finalOutput}" "${inputPath}"`;
  }

  try {
    execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] });

    let content = fs.readFileSync(finalOutput, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
      fs.writeFileSync(finalOutput, content, 'utf-8');
    }

    return finalOutput;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Compilation failed: ${errorMessage}`);
  }
}