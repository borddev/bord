#!/usr/bin/env npx tsx

/**
 * Check if user is logged into X and report status via API
 * Polls until logged in, then completes setup
 */

import { chromium } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';

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

async function checkLogin(profileName: string): Promise<boolean> {
  const profilePath = join(PROFILES_DIR, profileName);

  if (!existsSync(profilePath)) {
    return false;
  }

  let context;
  try {
    // Launch headless to check cookies
    context = await chromium.launchPersistentContext(profilePath, {
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const page = await context.newPage();
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait a bit for redirects
    await page.waitForTimeout(2000);

    const url = page.url();
    const isLoggedIn = !url.includes('login') && !url.includes('i/flow') && url.includes('x.com');

    await context.close();
    return isLoggedIn;
  } catch (e) {
    if (context) await context.close().catch(() => {});
    return false;
  }
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
