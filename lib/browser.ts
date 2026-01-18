#!/usr/bin/env npx tsx

/**
 * BORD Browser - Browser automation with AdsPower or Playwright
 *
 * Supports two modes:
 * 1. AdsPower (recommended) - Best anti-detection, requires AdsPower installed
 * 2. Playwright (fallback) - Simple stealth, no extra software needed
 *
 * Usage:
 *   # AdsPower mode (default if ADSPOWER_PROFILE_ID is set)
 *   ADSPOWER_PROFILE_ID=k18yuu5q npx tsx lib/browser.ts launch
 *
 *   # Playwright mode (fallback)
 *   npx tsx lib/browser.ts launch my-profile
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, readdirSync, statSync, rmSync } from 'fs';

const BORD_DIR = process.cwd();
const PROFILES_DIR = join(BORD_DIR, 'data', 'browser-profiles');
const ADSPOWER_API = process.env.ADSPOWER_API || 'http://127.0.0.1:50325';

// Ensure profiles directory exists
if (!existsSync(PROFILES_DIR)) {
  mkdirSync(PROFILES_DIR, { recursive: true });
}

export interface BrowserOptions {
  headless?: boolean;
  proxy?: string;
  adspower?: boolean;
  adspowerProfileId?: string;
}

/**
 * Connect to AdsPower browser profile
 */
export async function connectAdsPower(profileId: string): Promise<{ browser: Browser; context: BrowserContext }> {
  console.log(`Connecting to AdsPower profile: ${profileId}`);

  // Open the profile via AdsPower API
  const openUrl = `${ADSPOWER_API}/api/v1/browser/start?user_id=${profileId}`;
  const response = await fetch(openUrl);
  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`AdsPower error: ${data.msg || 'Failed to open profile'}`);
  }

  const wsEndpoint = data.data.ws.puppeteer;
  console.log(`Connected to AdsPower WebSocket: ${wsEndpoint}`);

  // Connect Playwright to the AdsPower browser
  const browser = await chromium.connectOverCDP(wsEndpoint);
  const contexts = browser.contexts();
  const context = contexts[0] || await browser.newContext();

  return { browser, context };
}

/**
 * Close AdsPower browser profile
 */
export async function closeAdsPower(profileId: string): Promise<void> {
  const closeUrl = `${ADSPOWER_API}/api/v1/browser/stop?user_id=${profileId}`;
  await fetch(closeUrl);
}

/**
 * Check if AdsPower is running
 */
export async function isAdsPowerRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${ADSPOWER_API}/status`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List AdsPower profiles
 */
export async function listAdsPowerProfiles(): Promise<any[]> {
  try {
    const response = await fetch(`${ADSPOWER_API}/api/v1/user/list?page_size=100`);
    const data = await response.json();
    if (data.code === 0) {
      return data.data.list || [];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Apply stealth techniques to avoid detection (for Playwright mode)
 */
async function applyStealthScripts(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // @ts-ignore
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' },
      ],
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });
}

/**
 * Launch a browser (AdsPower or Playwright)
 */
export async function launchBrowser(
  profileName: string = 'default',
  options: BrowserOptions = {}
): Promise<BrowserContext> {
  // Check for AdsPower profile ID
  const adspowerProfileId = options.adspowerProfileId || process.env.ADSPOWER_PROFILE_ID;

  if (adspowerProfileId || options.adspower) {
    if (!adspowerProfileId) {
      throw new Error('ADSPOWER_PROFILE_ID environment variable required for AdsPower mode');
    }
    const { context } = await connectAdsPower(adspowerProfileId);
    return context;
  }

  // Fallback to Playwright
  console.log(`Launching Playwright browser with profile: ${profileName}`);
  const profilePath = join(PROFILES_DIR, profileName);

  if (!existsSync(profilePath)) {
    mkdirSync(profilePath, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(profilePath, {
    headless: options.headless ?? false,
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
    ...(options.proxy ? { proxy: { server: options.proxy } } : {}),
  });

  return context;
}

/**
 * Get a new page with stealth scripts applied
 */
export async function getPage(context: BrowserContext): Promise<Page> {
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();
  await applyStealthScripts(page);
  return page;
}

/**
 * Check if logged into X/Twitter
 */
export async function isLoggedIntoX(page: Page): Promise<boolean> {
  try {
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const url = page.url();
    return !url.includes('login') && !url.includes('i/flow');
  } catch {
    return false;
  }
}

/**
 * List all Playwright profiles
 */
export function listProfiles(): string[] {
  if (!existsSync(PROFILES_DIR)) return [];
  return readdirSync(PROFILES_DIR).filter((f: string) => {
    return statSync(join(PROFILES_DIR, f)).isDirectory();
  });
}

/**
 * Delete a Playwright profile
 */
export function deleteProfile(profileName: string): void {
  const profilePath = join(PROFILES_DIR, profileName);
  if (existsSync(profilePath)) {
    rmSync(profilePath, { recursive: true });
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'launch') {
    const profileOrId = args[1];
    const adspowerProfileId = process.env.ADSPOWER_PROFILE_ID || profileOrId;

    // Check if AdsPower is running
    isAdsPowerRunning().then(async (adsRunning) => {
      if (adsRunning && adspowerProfileId) {
        console.log(`Launching AdsPower profile: ${adspowerProfileId}`);
        try {
          const { context } = await connectAdsPower(adspowerProfileId);
          const page = await getPage(context);

          // Check login status
          const loggedIn = await isLoggedIntoX(page);
          console.log(`X login status: ${loggedIn ? 'Logged in' : 'Not logged in'}`);

          if (!loggedIn) {
            console.log('Please log into X in the browser window...');
            await page.goto('https://x.com/login');
          }

          console.log('Browser ready! Press Ctrl+C to close.');

          // Keep running
          process.on('SIGINT', async () => {
            console.log('\nClosing AdsPower profile...');
            await closeAdsPower(adspowerProfileId);
            process.exit(0);
          });
        } catch (e: any) {
          console.error('Error:', e.message);
          process.exit(1);
        }
      } else {
        // Playwright fallback
        const profile = profileOrId || 'default';
        console.log(`Launching Playwright browser with profile: ${profile}`);
        const context = await launchBrowser(profile);
        const page = await getPage(context);
        await page.goto('https://x.com');
        console.log('Browser launched! Close the window when done.');

        await new Promise<void>((resolve) => {
          context.on('close', () => resolve());
        });
        console.log('Browser closed.');
        process.exit(0);
      }
    });
  } else if (command === 'list') {
    console.log('Checking profiles...\n');

    // Check AdsPower
    isAdsPowerRunning().then(async (running) => {
      if (running) {
        console.log('AdsPower profiles:');
        const profiles = await listAdsPowerProfiles();
        profiles.forEach((p: any) => {
          console.log(`  - ${p.name || p.user_id} (ID: ${p.user_id})`);
        });
        console.log('');
      } else {
        console.log('AdsPower: Not running\n');
      }

      console.log('Playwright profiles:');
      const localProfiles = listProfiles();
      if (localProfiles.length === 0) {
        console.log('  (none)');
      } else {
        localProfiles.forEach((p) => console.log(`  - ${p}`));
      }
    });
  } else if (command === 'delete') {
    const profile = args[1];
    if (!profile) {
      console.log('Usage: browser.ts delete <profile-name>');
      process.exit(1);
    }
    deleteProfile(profile);
    console.log(`Deleted Playwright profile: ${profile}`);
  } else if (command === 'status') {
    isAdsPowerRunning().then((running) => {
      console.log(`AdsPower: ${running ? 'Running' : 'Not running'}`);
      console.log(`API endpoint: ${ADSPOWER_API}`);
    });
  } else {
    console.log(`
BORD Browser - Browser automation with AdsPower or Playwright

Usage:
  npx tsx lib/browser.ts launch [profile-id]   Launch browser
  npx tsx lib/browser.ts list                  List profiles
  npx tsx lib/browser.ts delete <profile>      Delete Playwright profile
  npx tsx lib/browser.ts status                Check AdsPower status

Environment:
  ADSPOWER_API=http://127.0.0.1:50325         AdsPower API endpoint
  ADSPOWER_PROFILE_ID=xxx                     Default AdsPower profile ID

If AdsPower is running, it will be used automatically.
Otherwise, falls back to Playwright with stealth settings.
`);
  }
}
