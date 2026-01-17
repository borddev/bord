import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedPath = searchParams.get('path') || process.cwd();

  try {
    // Security: ensure path is within allowed directories
    const resolvedPath = path.resolve(requestedPath);
    const cwd = process.cwd();

    // Only allow browsing within the project directory
    if (!resolvedPath.startsWith(cwd)) {
      return NextResponse.json(
        { error: 'Access denied: Path outside project directory' },
        { status: 403 }
      );
    }

    const stats = fs.statSync(resolvedPath);

    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Not a directory' },
        { status: 400 }
      );
    }

    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

    const files = entries
      .filter(entry => !entry.name.startsWith('.')) // Hide hidden files
      .map(entry => {
        const fullPath = path.join(resolvedPath, entry.name);
        let size: number | undefined;
        let modified: string | undefined;

        try {
          const entryStats = fs.statSync(fullPath);
          size = entry.isFile() ? entryStats.size : undefined;
          modified = entryStats.mtime.toISOString();
        } catch {
          // Ignore stat errors
        }

        return {
          name: entry.name,
          path: fullPath,
          type: entry.isDirectory() ? 'directory' : 'file',
          size,
          modified,
        };
      });

    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to read directory' },
      { status: 500 }
    );
  }
}
