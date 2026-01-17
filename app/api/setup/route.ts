import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
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
  logs?: string[];
  app?: {
    name: string;
    description: string;
    icon: string;
    features: string[];
  };
  waitingForLogin?: boolean;
}

function ensureDir() {
  const dir = join(homedir(), 'bord', 'data');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
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
    complete: false,
    logs: []
  };
}

function setStatus(status: SetupStatus): void {
  ensureDir();
  writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

export async function GET() {
  return NextResponse.json(getStatus());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = getStatus();

    // If adding a log, append to existing logs
    if (body.log) {
      const logs = current.logs || [];
      logs.push(body.log);
      const updated: SetupStatus = {
        ...current,
        logs
      };
      // Also update other fields if provided
      if (body.step !== undefined) updated.step = body.step;
      if (body.message !== undefined) updated.message = body.message;
      if (body.progress !== undefined) updated.progress = body.progress;
      if (body.complete !== undefined) updated.complete = body.complete;
      if (body.error !== undefined) updated.error = body.error;
      if (body.redirect !== undefined) updated.redirect = body.redirect;
      if (body.app !== undefined) updated.app = body.app;
      if (body.waitingForLogin !== undefined) updated.waitingForLogin = body.waitingForLogin;

      setStatus(updated);
      return NextResponse.json(updated);
    }

    // Otherwise, merge all fields
    const updated: SetupStatus = {
      ...current,
      ...body,
      logs: body.logs !== undefined ? body.logs : current.logs
    };
    setStatus(updated);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  // Reset setup status
  ensureDir();
  const initial: SetupStatus = {
    step: 0,
    message: 'Waiting for setup to start...',
    progress: 0,
    complete: false,
    logs: []
  };
  setStatus(initial);
  return NextResponse.json(initial);
}
