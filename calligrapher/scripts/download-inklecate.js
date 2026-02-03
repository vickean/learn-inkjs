#!/usr/bin/env node

/**
 * Setup script to download inklecate compiler
 * Run this after cloning the repository
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const os = require('os');

const BIN_DIR = path.join(__dirname, '..', 'bin');

function getPlatform() {
  const platform = os.platform();
  const arch = os.arch();
  return `${platform}-${arch}`;
}

function getReleaseAssetUrl() {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    const arch = os.arch();
    
    let assetPatterns = [];
    if (platform === 'linux' && arch === 'x64') {
      assetPatterns = ['inklecate_linux.zip', 'inklecate-linux-x86_64.zip'];
    } else if (platform === 'darwin') {
      assetPatterns = ['inklecate_mac.zip', 'inklecate-macos.zip'];
    } else if (platform === 'win32') {
      assetPatterns = ['inklecate_windows.zip', 'inklecate-win-x86_64.zip'];
    }
    
    console.log(`Finding latest release...`);
    
    https.get(
      'https://api.github.com/repos/inkle/ink/releases/latest',
      { headers: { 'User-Agent': 'Calligrapher-Setup' } },
      (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            const asset = release.assets?.find(a => 
              assetPatterns.some(pattern => a.name === pattern)
            );
            
            if (!asset) {
              console.error('Available assets:', release.assets?.map(a => a.name));
              reject(new Error(`Asset not found for platform ${getPlatform()} (looked for: ${assetPatterns.join(', ')})`));
              return;
            }
            
            resolve(asset.browser_download_url);
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    
    const file = fs.createWriteStream(dest);
    const options = new URL(url);
    options.headers = { 'User-Agent': 'Calligrapher-Setup' };
    
    https.get(options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        const redirectUrl = response.headers.location;
        console.log(`Following redirect to: ${redirectUrl}`);
        downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode === 403) {
        reject(new Error('GitHub API rate limit exceeded. Please wait a few minutes or download manually.'));
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function extractZip(zipPath, dest) {
  console.log('Extracting archive...');
  
  const platform = os.platform();
  
  if (platform === 'linux' || platform === 'darwin') {
    try {
      // Try to extract using unzip
      await exec(`unzip -o "${zipPath}" -d "${dest}"`);
      
      // Find and move inklecate if it's in a subdirectory
      const files = fs.readdirSync(dest);
      const inklecateFiles = files.filter(f => 
        f.startsWith('inklecate') && !f.includes('.zip') && !f.includes('.dll')
      );
      
      if (inklecateFiles.length > 0) {
        const srcPath = path.join(dest, inklecateFiles[0]);
        const destPath = path.join(dest, 'inklecate');
        
        if (srcPath !== destPath) {
          if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
          }
          fs.renameSync(srcPath, destPath);
          console.log(`Moved ${inklecateFiles[0]} to inklecate`);
        }
      }
      
    } catch (e) {
      throw new Error(`Failed to extract: ${e.message}`);
    }
  } else if (platform === 'win32') {
    try {
      await exec(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${dest}' -Force"`);
    } catch (e) {
      throw new Error(`Failed to extract: ${e.message}`);
    }
  }
}

async function setupInklecate() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     Calligrapher Setup - Download inklecate        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }
  
  const tempZip = path.join(BIN_DIR, 'inklecate-temp.zip');
  
  try {
    // Get the correct download URL
    const url = await getReleaseAssetUrl();
    
    // Download
    await downloadFile(url, tempZip);
    
    // Extract
    await extractZip(tempZip, BIN_DIR);
    
    // Set executable permission on Linux/macOS
    if (os.platform() !== 'win32') {
      const inklecatePath = path.join(BIN_DIR, 'inklecate');
      if (fs.existsSync(inklecatePath)) {
        fs.chmodSync(inklecatePath, 0o755);
      }
    }
    
    // Clean up
    if (fs.existsSync(tempZip)) {
      fs.unlinkSync(tempZip);
    }
    
    // Verify
    const inklecatePath = path.join(BIN_DIR, 'inklecate');
    const inklecateExePath = path.join(BIN_DIR, 'inklecate.exe');
    
    if (!fs.existsSync(inklecatePath) && !fs.existsSync(inklecateExePath)) {
      throw new Error('inklecate not found after extraction');
    }
    
    console.log('\n✓ Setup complete!\n');
    console.log('You can now run:');
    console.log('  ./bin/calligrapher.js <file.ink|file.txt>');
    
  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    console.error('\nAlternative: Download manually from:');
    console.error('  https://github.com/inkle/ink/releases');
    console.error('Then extract to: bin/');
    process.exit(1);
  }
}

setupInklecate();