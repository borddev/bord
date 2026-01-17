#!/usr/bin/env npx tsx

/**
 * BORD Browser - Stealth Playwright wrapper
 *
 * Provides anti-detection browser automation without AdsPower.
 * Uses playwright-extra with stealth plugin.
 *
 * Usage:
 *   import { launchBrowser, getPage } from '~/bord/lib/browser'
 *   const browser = await launchBrowser('x-reply-guy')
 *   const page = await getPage(browser)
 *   await page.goto('https://x.com')
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';

const BORD_DIR = join(homedir(), 'bord');
const PROFILES_DIR = join(BORD_DIR, 'data', 'browser-profiles');

// Ensure profiles directory exists
if (!existsSync(PROFILES_DIR)) {
  mkdirSync(PROFILES_DIR, { recursive: true });
}

/**
 * Apply stealth techniques to avoid detection
 */
async function applyStealthScripts(page: Page): Promise<void> {
  // Hide webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  // Hide automation flags
  await page.addInitScript(() => {
    // @ts-ignore
    window.chrome = { runtime: {} };
  });

  // Fake plugins
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' },
      ],
    });
  });

  // Fake languages
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });

  // Hide headless indicators
  await page.addInitScript(() => {
    // Permissions API
    const originalQuery = window.navigator.permissions.query;
    // @ts-ignore
    window.navigator.permissions.query = (parameters: any) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
        : originalQuery(parameters);
  });
}

export interface BrowserOptions {
  headless?: boolean;
  proxy?: string;
}

/**
 * Launch a stealth browser with persistent profile
 */
export async function launchBrowser(
  profileName: string = 'default',
  options: BrowserOptions = {}
): Promise<BrowserContext> {
  const profilePath = join(PROFILES_DIR, profileName);

  // Ensure profile directory exists
  if (!existsSync(profilePath)) {
    mkdirSync(profilePath, { recursive: true });
  }

  const launchOptions: any = {
    headless: options.headless ?? false, // Default to visible
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  };

  if (options.proxy) {
    launchOptions.proxy = { server: options.proxy };
  }

  // Launch with persistent context (keeps cookies/session)
  const context = await chromium.launchPersistentContext(profilePath, launchOptions);

  return context;
}

/**
 * Get a new page with stealth scripts applied
 */
export async function getPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await applyStealthScripts(page);
  return page;
}

/**
 * Get existing page or create new one
 */
export async function getOrCreatePage(context: BrowserContext): Promise<Page> {
  const pages = context.pages();
  if (pages.length > 0) {
    return pages[0];
  }
  return getPage(context);
}

/**
 * Check if logged into X/Twitter
 */
export async function isLoggedIntoX(page: Page): Promise<boolean> {
  try {
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 10000 });
    // If we're redirected to login, we're not logged in
    const url = page.url();
    return !url.includes('login') && !url.includes('i/flow');
  } catch {
    return false;
  }
}

/**
 * List all browser profiles
 */
export function listProfiles(): string[] {
  if (!existsSync(PROFILES_DIR)) return [];
  const { readdirSync } = require('fs');
  return readdirSync(PROFILES_DIR).filter((f: string) => {
    const stat = require('fs').statSync(join(PROFILES_DIR, f));
    return stat.isDirectory();
  });
}

/**
 * Delete a browser profile
 */
export function deleteProfile(profileName: string): void {
  const profilePath = join(PROFILES_DIR, profileName);
  if (existsSync(profilePath)) {
    const { rmSync } = require('fs');
    rmSync(profilePath, { recursive: true });
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'launch') {
    const profile = args[1] || 'default';
    console.log(`Launching BORD Browser with profile: ${profile}`);
    launchBrowser(profile).then(async (context) => {
      const page = await getPage(context);
      await page.goto('https://x.com');
      console.log('Browser launched! Close the window when done.');
    });
  } else if (command === 'list') {
    console.log('Browser profiles:');
    listProfiles().forEach((p) => console.log(`  - ${p}`));
  } else if (command === 'delete') {
    const profile = args[1];
    if (!profile) {
      console.log('Usage: browser.ts delete <profile-name>');
      process.exit(1);
    }
    deleteProfile(profile);
    console.log(`Deleted profile: ${profile}`);
  } else {
    console.log(`
BORD Browser - Stealth browser automation

Usage:
  npx tsx ~/bord/lib/browser.ts launch [profile]   Launch browser
  npx tsx ~/bord/lib/browser.ts list               List profiles
  npx tsx ~/bord/lib/browser.ts delete <profile>   Delete profile

Profiles are stored in: ~/bord/data/browser-profiles/
`);
  }
}
