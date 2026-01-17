import { NextResponse } from 'next/server';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const BORD_DIR = join(homedir(), 'bord');

interface ClaudeMdFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'core' | 'app';
}

export async function GET() {
  try {
    const files: ClaudeMdFile[] = [];

    // Check for core CLAUDE.md
    const corePath = join(BORD_DIR, 'CLAUDE.md');
    try {
      const content = await readFile(corePath, 'utf-8');
      files.push({
        id: 'core',
        name: 'BORD (Core)',
        path: corePath,
        content,
        type: 'core'
      });
    } catch {
      // Create default if doesn't exist
      const defaultContent = `# BORD - Claude Code Instructions

This is your BORD installation. Claude Code reads this file to understand how to work with your setup.

## Directory Structure

\`\`\`
~/bord/
├── app/           # Next.js pages
├── apps/          # Installed BORD apps
├── lib/           # Shared utilities
├── .env.local     # Your secrets (never commit)
└── CLAUDE.md      # This file
\`\`\`

## Installed Apps

Check the apps/ folder for installed applications. Each app has its own CLAUDE.md with specific instructions.

## Environment Variables

All secrets are stored in .env.local. Never commit this file.

## Running the Server

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000
`;
      files.push({
        id: 'core',
        name: 'BORD (Core)',
        path: corePath,
        content: defaultContent,
        type: 'core'
      });
    }

    // Check for app CLAUDE.md files
    const appsDir = join(BORD_DIR, 'apps');
    try {
      const apps = await readdir(appsDir);
      for (const appName of apps) {
        const appPath = join(appsDir, appName);
        const appStat = await stat(appPath);
        if (appStat.isDirectory()) {
          const claudeMdPath = join(appPath, 'CLAUDE.md');
          try {
            const content = await readFile(claudeMdPath, 'utf-8');
            files.push({
              id: appName,
              name: appName,
              path: claudeMdPath,
              content,
              type: 'app'
            });
          } catch {
            // App doesn't have CLAUDE.md
          }
        }
      }
    } catch {
      // apps folder doesn't exist
    }

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load files' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { path, content } = await request.json();

    if (!path || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Security: only allow writing to BORD directory
    if (!path.startsWith(BORD_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    await writeFile(path, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
