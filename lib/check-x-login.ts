#!/usr/bin/env npx tsx

/**
 * Check if user is logged into X and report status via API
 * Monitors the profile directory for auth cookie changes
 */

import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readFileSync, statSync } from 'fs';

const PROFILES_DIR = join(homedir(), 'bord', 'data', 'browser-profiles');
const API_URL = 'http://localhost:3000/api/setup';

async function log(message: string) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log: message })
    });
  } catch {}
  console.log(message);
}

async function updateStatus(data: any) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch {}
}

function checkCookiesFile(profileName: string): boolean {
  const profilePath = join(PROFILES_DIR, profileName);
  const cookiesPath = join(profilePath, 'Default', 'Cookies');
  const cookiesPathAlt = join(profilePath, 'Cookies');

  // Check for cookie file existence and size
  for (const path of [cookiesPath, cookiesPathAlt]) {
    if (existsSync(path)) {
      try {
        const stats = statSync(path);
        // If cookies file is larger than 10KB, user likely logged in
        if (stats.size > 10000) {
          return true;
        }
      } catch {}
    }
  }

  // Also check for Local State file which gets updated on login
  const localStatePath = join(profilePath, 'Local State');
  if (existsSync(localStatePath)) {
    try {
      const content = readFileSync(localStatePath, 'utf-8');
      // Check if there's encryption_mode set (indicates active session)
      if (content.includes('"os_crypt"') && content.includes('"encrypted_key"')) {
        const stats = statSync(localStatePath);
        // File should be recent (within last 5 minutes) to indicate active login
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (stats.mtimeMs > fiveMinutesAgo) {
          return true;
        }
      }
    } catch {}
  }

  return false;
}

async function checkLogin(profileName: string): Promise<boolean> {
  const profilePath = join(PROFILES_DIR, profileName);

  if (!existsSync(profilePath)) {
    return false;
  }

  // Check cookie file for auth data
  return checkCookiesFile(profileName);
}

async function main() {
  const profileName = process.argv[2] || 'x-reply-guy';
  const maxAttempts = 60; // 5 minutes max
  let attempts = 0;

  await log('→ Waiting for X login...');
  await updateStatus({
    waitingForLogin: true,
    message: 'Login to X in the browser window...'
  });

  while (attempts < maxAttempts) {
    attempts++;

    const isLoggedIn = await checkLogin(profileName);

    if (isLoggedIn) {
      await log('✓ Login detected!');
      await updateStatus({
        waitingForLogin: false,
        step: 4,
        message: 'Login successful! Completing setup...',
        progress: 90
      });

      // Send notification
      try {
        const { execSync } = require('child_process');
        execSync('terminal-notifier -title "BORD" -message "Login successful!" -sound default', { stdio: 'ignore' });
      } catch {}

      // Complete setup
      await new Promise(r => setTimeout(r, 1000));
      await log('✓ Setup complete!');
      await updateStatus({
        step: 4,
        message: 'X Reply Guy is ready!',
        progress: 100,
        complete: true,
        redirect: '/x-reply-guy'
      });

      // Final notification
      try {
        const { execSync } = require('child_process');
        execSync('terminal-notifier -title "X Reply Guy" -message "Setup complete! Opening dashboard..." -sound Glass', { stdio: 'ignore' });
      } catch {}

      process.exit(0);
    }

    // Wait 5 seconds before next check
    await new Promise(r => setTimeout(r, 5000));

    if (attempts % 6 === 0) {
      await log(`! Still waiting for login... (${Math.floor(attempts * 5 / 60)}m)`);
    }
  }

  await log('✗ Login timeout - please try again');
  await updateStatus({
    waitingForLogin: false,
    error: 'Login timeout',
    message: 'Login timeout - please restart setup'
  });

  process.exit(1);
}

main().catch(console.error);
