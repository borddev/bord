import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This endpoint returns installed apps
export async function GET() {
  try {
    const appsDir = path.join(process.cwd(), 'apps');
    const apps: Array<{
      id: string;
      name: string;
      description: string;
      href: string;
      color: string;
      icon: null; // Icons are rendered client-side
      installed: boolean;
    }> = [];

    if (!fs.existsSync(appsDir)) {
      return NextResponse.json({ apps: [] });
    }

    const appFolders = fs.readdirSync(appsDir);

    for (const appId of appFolders) {
      const configPath = path.join(appsDir, appId, 'config.json');
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          apps.push({
            id: appId,
            name: config.name || appId,
            description: config.description || '',
            href: config.href || `/${appId}`,
            color: config.color || '#666',
            icon: null,
            installed: true
          });
        } catch {
          // Skip invalid configs
        }
      }
    }

    return NextResponse.json({ apps });
  } catch (error) {
    return NextResponse.json({ apps: [] });
  }
}
