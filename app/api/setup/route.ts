import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_FILE = join(homedir(), 'bord', 'data', 'setup-status.json');

interface SetupStatus {
  step: number;
  message: string;
  progress: number;
  complete: boolean;
  error?: string;
  redirect?: string;
}

function getStatus(): SetupStatus {
  try {
    if (existsSync(STATUS_FILE)) {
      return JSON.parse(readFileSync(STATUS_FILE, 'utf-8'));
    }
  } catch {}
  return {
    step: 0,
    message: 'Waiting for setup to start...',
    progress: 0,
    complete: false
  };
}

function setStatus(status: SetupStatus): void {
  const dir = join(homedir(), 'bord', 'data');
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

export async function GET() {
  return NextResponse.json(getStatus());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = getStatus();
    const updated: SetupStatus = {
      ...current,
      ...body
    };
    setStatus(updated);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
