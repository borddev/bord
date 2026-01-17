import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This endpoint returns secret keys required by installed apps
export async function GET() {
  try {
    const appsDir = path.join(process.cwd(), 'apps');
    const keys: Array<{ key: string; description: string; required: boolean }> = [];

    if (!fs.existsSync(appsDir)) {
      return NextResponse.json({ keys: [] });
    }

    // Read each app's config for required secrets
    const apps = fs.readdirSync(appsDir);

    for (const app of apps) {
      const configPath = path.join(appsDir, app, 'config.json');
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          if (config.secrets) {
            keys.push(...config.secrets);
          }
        } catch {
          // Skip invalid configs
        }
      }
    }

    return NextResponse.json({ keys });
  } catch (error) {
    return NextResponse.json({ keys: [] });
  }
}
