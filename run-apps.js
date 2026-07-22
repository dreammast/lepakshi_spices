import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('=== Checking and Installing Dependencies ===');

const targets = [
  { name: 'Root', path: rootDir },
  { name: 'Server', path: path.join(rootDir, 'server') },
  { name: 'Admin Frontend', path: path.join(rootDir, 'apps', 'admin') },
  { name: 'User Frontend', path: path.join(rootDir, 'apps', 'user') }
];

for (const target of targets) {
  const nodeModulesPath = path.join(target.path, 'node_modules');
  const needsInstall = !fs.existsSync(nodeModulesPath) || (target.name === 'Server' && !fs.existsSync(path.join(target.path, 'node_modules', 'tsx')));
  if (needsInstall) {
    console.log(`[+] Installing dependencies for ${target.name}...`);
    try {
      execSync('npm install', { cwd: target.path, stdio: 'inherit' });
      console.log(`[✓] ${target.name} dependencies installed successfully.`);
    } catch (err) {
      console.error(`[X] Error installing dependencies for ${target.name}:`, err.message);
    }
  } else {
    console.log(`[✓] ${target.name} dependencies already installed.`);
  }
}

console.log('\n=== Pushing & Verifying TiDB Database Schema ===');
try {
  execSync('node scripts/push-db-schema.mjs', { cwd: rootDir, stdio: 'inherit' });
  console.log('[✓] Database schema verified & updated on TiDB.');
} catch (err) {
  console.error('[!] Database schema update warning:', err.message);
}

console.log('\n=== Starting Lepakshi Spices Application Services ===');

// 1. Server
console.log('Launching Backend Server...');
const serverProc = spawn('cmd.exe', ['/c', 'npm', '--prefix', 'server', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// 2. Admin Frontend
console.log('Launching Admin Frontend...');
const adminProc = spawn('cmd.exe', ['/c', 'npm', '--prefix', 'apps/admin', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// 3. User Frontend
console.log('Launching User Frontend...');
const userProc = spawn('cmd.exe', ['/c', 'npm', '--prefix', 'apps/user', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

console.log('\nAll application services launched and running concurrently.');
