import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const CLAUDE_DIR = join(homedir(), '.claude', 'projects');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileName = `${id}.jsonl`;

    // Search for the file in all project folders
    const projects = await readdir(CLAUDE_DIR);

    for (const project of projects) {
      const projectPath = join(CLAUDE_DIR, project);
      const filePath = join(projectPath, fileName);

      try {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);

        const messages: Array<{ role: string; content: string }> = [];

        for (const line of lines) {
          try {
            const msg = JSON.parse(line);

            if (msg.type === 'human' && msg.message?.content) {
              const content = typeof msg.message.content === 'string'
                ? msg.message.content
                : JSON.stringify(msg.message.content);
              messages.push({ role: 'user', content });
            } else if (msg.type === 'assistant' && msg.message?.content) {
              let content = '';
              if (typeof msg.message.content === 'string') {
                content = msg.message.content;
              } else if (Array.isArray(msg.message.content)) {
                // Handle content blocks
                content = msg.message.content
                  .filter((block: { type: string }) => block.type === 'text')
                  .map((block: { text: string }) => block.text)
                  .join('\n');
              }
              if (content) {
                messages.push({ role: 'assistant', content });
              }
            }
          } catch {
            // Skip invalid lines
          }
        }

        return NextResponse.json({ messages });
      } catch {
        // File not in this project folder
      }
    }

    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load chat' }, { status: 500 });
  }
}
