#!/usr/bin/env npx tsx

/**
 * BORD Notification Helper
 *
 * Usage from Claude Code:
 *   npx tsx ~/bord/lib/notify.ts "Message"
 *   npx tsx ~/bord/lib/notify.ts "Message" --app x-reply-guy
 *   npx tsx ~/bord/lib/notify.ts "Message" --app bord --subtitle "Subtitle"
 *
 * Apps automatically use their own icon from:
 *   ~/bord/apps/[app-name]/public/icon.png
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const BORD_DIR = join(homedir(), 'bord');

// App display names
const APP_NAMES: Record<string, string> = {
  'bord': 'BORD',
  'x-reply-guy': 'X Reply Guy',
};

interface NotifyOptions {
  message: string;
  app?: string;
  subtitle?: string;
  sound?: boolean;
}

function getAppIcon(app: string): string | null {
  const iconPaths = [
    // App-specific icons
    join(BORD_DIR, 'apps', app, 'public', 'icon.png'),
    join(BORD_DIR, 'apps', app, 'public', 'logo.png'),
    join(BORD_DIR, 'apps', app, 'icon.png'),
    // BORD core icons
    join(BORD_DIR, 'public', 'icon.png'),
    join(BORD_DIR, 'public', 'logo.png'),
  ];

  return iconPaths.find(p => existsSync(p)) || null;
}

export function notify(options: NotifyOptions | string, app?: string) {
  // Handle simple string argument
  if (typeof options === 'string') {
    options = { message: options, app };
  }

  const { message, app: appName = 'bord', subtitle, sound = true } = options;
  const title = APP_NAMES[appName] || appName;
  const icon = getAppIcon(appName);

  // Build command
  const args = [
    'terminal-notifier',
    '-title', JSON.stringify(title),
    '-message', JSON.stringify(message),
  ];

  if (subtitle) {
    args.push('-subtitle', JSON.stringify(subtitle));
  }

  if (sound) {
    args.push('-sound', 'default');
  }

  if (icon) {
    // -contentImage shows logo on right side of notification
    // (can't replace left app icon - macOS security restriction)
    args.push('-contentImage', icon);
  }

  try {
    execSync(args.join(' '), { stdio: 'ignore' });
    return true;
  } catch {
    // Fallback to osascript
    try {
      const script = `display notification "${message}" with title "${title}"${subtitle ? ` subtitle "${subtitle}"` : ''}${sound ? ' sound name "default"' : ''}`;
      execSync(`osascript -e '${script}'`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
BORD Notification System

Usage:
  npx tsx ~/bord/lib/notify.ts "Message"
  npx tsx ~/bord/lib/notify.ts "Message" --app x-reply-guy
  npx tsx ~/bord/lib/notify.ts "Message" --app bord --subtitle "Info"

Options:
  --app        App name (uses app's icon)
  --subtitle   Subtitle text
  --no-sound   Disable sound

Examples:
  npx tsx ~/bord/lib/notify.ts "Server started!" --app bord
  npx tsx ~/bord/lib/notify.ts "Reply posted!" --app x-reply-guy --subtitle "+1,234 views"
`);
    process.exit(0);
  }

  // Parse arguments
  const message = args[0];
  let app = 'bord';
  let subtitle: string | undefined;
  let sound = true;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--app' && args[i + 1]) {
      app = args[++i];
    } else if (args[i] === '--subtitle' && args[i + 1]) {
      subtitle = args[++i];
    } else if (args[i] === '--no-sound') {
      sound = false;
    }
  }

  notify({ message, app, subtitle, sound });
}
