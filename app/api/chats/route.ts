import { NextResponse } from 'next/server';
import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const CLAUDE_DIR = join(homedir(), '.claude', 'projects');

interface Chat {
  id: string;
  name: string;
  date: string;
  preview: string;
  messageCount: number;
}

export async function GET() {
  try {
    const chats: Chat[] = [];

    // Read all project folders
    let projects: string[] = [];
    try {
      projects = await readdir(CLAUDE_DIR);
    } catch {
      return NextResponse.json({ chats: [] });
    }

    for (const project of projects) {
      const projectPath = join(CLAUDE_DIR, project);
      const projectStat = await stat(projectPath);

      if (!projectStat.isDirectory()) continue;

      // Read all .jsonl files in the project
      const files = await readdir(projectPath);
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));

      for (const file of jsonlFiles) {
        const filePath = join(projectPath, file);
        const fileStat = await stat(filePath);

        try {
          const content = await readFile(filePath, 'utf-8');
          const lines = content.trim().split('\n').filter(Boolean);

          if (lines.length === 0) continue;

          // Parse first and last messages for preview
          let firstUserMessage = '';
          let messageCount = 0;

          for (const line of lines) {
            try {
              const msg = JSON.parse(line);
              messageCount++;
              if (!firstUserMessage && msg.type === 'human') {
                firstUserMessage = typeof msg.message?.content === 'string'
                  ? msg.message.content.slice(0, 100)
                  : 'Chat session';
              }
            } catch {
              // Skip invalid lines
            }
          }

          // Extract project name from path
          const projectName = project.replace(/-/g, '/').replace(/^-/, '');

          chats.push({
            id: file.replace('.jsonl', ''),
            name: projectName || 'Unknown project',
            date: fileStat.mtime.toISOString(),
            preview: firstUserMessage || 'Empty chat',
            messageCount
          });
        } catch {
          // Skip files that can't be read
        }
      }
    }

    // Sort by date, newest first
    chats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ chats: chats.slice(0, 50) }); // Limit to 50 most recent
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load chats' }, { status: 500 });
  }
}
