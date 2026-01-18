#!/usr/bin/env npx tsx

/**
 * BORD Browser - Browser automation with AdsPower or Playwright
 *
 * Supports three modes:
 * 1. AdsPower (connect to running) - Open browser in AdsPower GUI, BORD connects to it
 * 2. AdsPower API - Requires premium, launches browser via API
 * 3. Playwright (fallback) - Simple stealth, no extra software needed
 *
 * Usage:
 *   # Connect to already-running AdsPower browser (FREE - recommended)
 *   npx tsx lib/browser.ts connect
 *
 *   # AdsPower API mode (requires premium)
 *   ADSPOWER_API_KEY=xxx ADSPOWER_PROFILE_ID=k18yuu5q npx tsx lib/browser.ts launch
 *
 *   # Playwright mode (fallback)
 *   npx tsx lib/browser.ts launch my-profile
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, readdirSync, statSync, rmSync } from 'fs';
import { execSync } from 'child_process';

const BORD_DIR = process.cwd();
const PROFILES_DIR = join(BORD_DIR, 'data', 'browser-profiles');
const ADSPOWER_API = process.env.ADSPOWER_API || 'http://127.0.0.1:50325';
const ADSPOWER_API_KEY = process.env.ADSPOWER_API_KEY || '';

/**
 * Build AdsPower API URL with optional API key
 */
function buildAdsPowerUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(path, ADSPOWER_API);
  if (ADSPOWER_API_KEY) {
    url.searchParams.set('api_key', ADSPOWER_API_KEY);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

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
  const openUrl = buildAdsPowerUrl('/api/v1/browser/start', { user_id: profileId });
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
  const closeUrl = buildAdsPowerUrl('/api/v1/browser/stop', { user_id: profileId });
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
 * Find running AdsPower/SunBrowser debug ports (no API needed)
 * This works with free AdsPower - just open your browser in AdsPower GUI first
 */
export function findAdsPowerDebugPorts(): number[] {
  try {
    // Use lsof to find SunBrowser listening ports
    const output = execSync('lsof -i -P -n 2>/dev/null | grep SunBrow | grep LISTEN || true', {
      encoding: 'utf-8',
    });

    const ports: number[] = [];
    const lines = output.trim().split('\n').filter(Boolean);

    for (const line of lines) {
      // Match port number from lines like: "SunBrowse 17930 claudio   63u  IPv4 ... TCP 127.0.0.1:54689 (LISTEN)"
      const match = line.match(/:(\d+)\s+\(LISTEN\)/);
      if (match) {
        ports.push(parseInt(match[1], 10));
      }
    }

    return ports;
  } catch {
    return [];
  }
}

/**
 * Connect to an already-running AdsPower browser via debug port
 * No API key needed - just open the browser in AdsPower GUI first
 */
export async function connectToRunningAdsPower(port?: number): Promise<{ browser: Browser; context: BrowserContext }> {
  // Find available ports if not specified
  const ports = port ? [port] : findAdsPowerDebugPorts();

  if (ports.length === 0) {
    throw new Error(
      'No running AdsPower browser found.\n' +
      'Please open a browser profile in AdsPower first, then run this command again.'
    );
  }

  const targetPort = ports[0];
  console.log(`Connecting to AdsPower browser on port ${targetPort}...`);

  try {
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${targetPort}`);
    const contexts = browser.contexts();
    const context = contexts[0] || await browser.newContext();

    console.log(`Connected to AdsPower browser successfully!`);
    return { browser, context };
  } catch (err: any) {
    throw new Error(`Failed to connect to AdsPower on port ${targetPort}: ${err.message}`);
  }
}

/**
 * List AdsPower profiles
 */
export async function listAdsPowerProfiles(): Promise<any[]> {
  try {
    const url = buildAdsPowerUrl('/api/v1/user/list', { page_size: '100' });
    const response = await fetch(url);
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

      // Also check for running browsers
      const ports = findAdsPowerDebugPorts();
      if (ports.length > 0) {
        console.log(`\nRunning AdsPower browsers found on ports: ${ports.join(', ')}`);
        console.log('Use "npx tsx lib/browser.ts connect" to connect to them.');
      }
    });
  } else if (command === 'connect') {
    // Connect to already-running AdsPower browser (no API needed!)
    const portArg = args[1];
    const port = portArg ? parseInt(portArg, 10) : undefined;

    console.log('Looking for running AdsPower browsers...');
    const ports = findAdsPowerDebugPorts();

    if (ports.length === 0) {
      console.log('\nNo running AdsPower browser found.');
      console.log('Please open a browser profile in AdsPower first, then run this command again.');
      process.exit(1);
    }

    console.log(`Found browsers on ports: ${ports.join(', ')}\n`);

    connectToRunningAdsPower(port).then(async ({ browser, context }) => {
      const page = await getPage(context);

      // Check login status
      const loggedIn = await isLoggedIntoX(page);
      console.log(`X login status: ${loggedIn ? 'Logged in ✓' : 'Not logged in'}`);

      if (!loggedIn) {
        console.log('Navigate to x.com in the browser to log in.');
      }

      console.log('\nConnected! Press Ctrl+C to disconnect.');
      console.log('The browser will stay open - you can close it in AdsPower.');

      process.on('SIGINT', async () => {
        console.log('\nDisconnecting from browser...');
        await browser.close();
        process.exit(0);
      });
    }).catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
  } else {
    console.log(`
BORD Browser - Browser automation with AdsPower or Playwright

Usage:
  npx tsx lib/browser.ts connect [port]        Connect to running AdsPower browser (FREE!)
  npx tsx lib/browser.ts launch [profile]      Launch new browser
  npx tsx lib/browser.ts list                  List profiles
  npx tsx lib/browser.ts delete <profile>      Delete Playwright profile
  npx tsx lib/browser.ts status                Check status & running browsers

Recommended workflow (no API key needed):
  1. Open a browser profile in AdsPower (just double-click it)
  2. Run: npx tsx lib/browser.ts connect
  3. BORD connects to your running browser!

Environment:
  ADSPOWER_API=http://127.0.0.1:50325         AdsPower API endpoint
  ADSPOWER_API_KEY=xxx                        AdsPower API key (premium only)
  ADSPOWER_PROFILE_ID=xxx                     Default AdsPower profile ID
`);
  }
}
