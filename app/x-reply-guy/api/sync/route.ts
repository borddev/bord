import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const SCRIPTS_DIR = path.join(process.cwd(), 'automations/x-reply-guy');

export async function POST(request: Request) {
  try {
    const { script } = await request.json();

    const allowedScripts = [
      'sync-analytics.js',
      'import-from-analytics.js',
      'import-csv-analytics.js',
      'check-all-analytics.js',
      'auto-sync-views.js'  // Full sync: opens X Analytics, downloads CSV, imports
    ];

    if (!allowedScripts.includes(script)) {
      return NextResponse.json({ error: 'Script not allowed' }, { status: 400 });
    }

    const scriptPath = path.join(SCRIPTS_DIR, script);
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      timeout: 180000, // 3 minutes
      cwd: SCRIPTS_DIR
    });

    return NextResponse.json({
      success: true,
      output: stdout,
      errors: stderr
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      output: e.stdout || '',
      errors: e.stderr || ''
    }, { status: 500 });
  }
}
